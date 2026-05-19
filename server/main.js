import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import multer from "multer"
import { GoogleGenAI } from "@google/genai"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

import UserModel from "./models/UserModel.js"
import PrivUserModel from "./models/PrivUserModel.js"
import otpModel from "./models/OtpModel.js"
import MLmodel from "./models/MlModel.js"
import AuditModel from "./models/AuditModel.js"
import DatasetModel from "./models/DatasetModel.js"
import ELinkModel from "./models/ELink.js"
import ConditionModel from "./models/ConditionModel.js"
import audit from "./audit/audit.js"
import authAudit from "./audit/authAudit.js"
import parseCSV from "./functions/parseCSV.js"

import { generateOtp, sendOtpEmail, saveOtp, verifyOtp, sendFraudEmail, sendEligibilityEmail, sendConditionEmail } from "./email.js"
import { type } from "os"

const subsidyApp = new express()
subsidyApp.use(express.json())
subsidyApp.use(cors())

// Configure multer for memory storage (files stored in MongoDB)
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
            cb(null, true)
        } else {
            cb(new Error("Only CSV files are allowed"), false)
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
})

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5000"
const SYNTHETIC_DATA_DIR = path.resolve(__dirname, "..", "synthetic data")
const ML_TRAINING_DATASET_PATH = path.join(SYNTHETIC_DATA_DIR, "synthetic_subsidy_cylinders.csv")

function toMlPath(filePath) {
    return filePath.split(path.sep).join("/")
}

function datasetSummary(dataset) {
    return {
        _id: dataset._id,
        originalName: dataset.originalName,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount
    }
}

async function writeDatasetForMl(dataset) {
    await fs.mkdir(SYNTHETIC_DATA_DIR, { recursive: true })
    let fileContent = dataset.content
    try {
        const records = JSON.parse(dataset.content)
        if (Array.isArray(records) && records.length > 0) {
            const headers = Object.keys(records[0]).join(",")
            const rows = records.map(row =>
                Object.values(row).map(val =>
                    String(val).includes(",") || String(val).includes('"')
                        ? `"${String(val).replace(/"/g, '""')}"`
                        : val
                ).join(",")
            )
            fileContent = [headers, ...rows].join("\n")
        }
    } catch {
        //DONT ADD ANYTHING HERE
    }
    await fs.writeFile(ML_TRAINING_DATASET_PATH, dataset.content, "utf-8")
    console.log(dataset.content)
    return {
        activeFile: toMlPath(ML_TRAINING_DATASET_PATH)
    }
}

async function notifyMlServerDataset(dataset, files) {
    const response = await fetch(`${ML_SERVICE_URL}/datafile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            datasetId: dataset._id.toString(),
            originalName: dataset.originalName,
            filename: files.activeFile,
            trainingFilename: files.activeFile
        })
    })

    const rawText = await response.text()
    let responseData
    try {
        responseData = rawText ? JSON.parse(rawText) : {}
    } catch {
        responseData = { raw: rawText }
    }

    if (!response.ok) {
        throw new Error(responseData.error || responseData.serverMsg || `ML server responded with ${response.status}`)
    }

    return responseData
}

async function syncDatasetWithMl(dataset) {
    const files = await writeDatasetForMl(dataset)

    try {
        return {
            files,
            mlServer: {
                synced: true,
                data: await notifyMlServerDataset(dataset, files)
            }
        }
    } catch (error) {
        return {
            files,
            mlServer: {
                synced: false,
                error: error.message
            }
        }
    }
}

async function syncActiveDatasetWithMl() {
    const activeDataset = await DatasetModel.findOne({ Active: true })
    if (!activeDataset) {
        return null
    }

    const sync = await syncDatasetWithMl(activeDataset)
    return {
        dataset: activeDataset,
        ...sync
    }
}

async function getEligibilityResultForUser(userId) {
    if (typeof userId !== "string" || !userId.trim()) {
        return null
    }

    const eligibilityLink = await ELinkModel.findOne({ UserID: userId.trim() }).sort({ updatedAt: -1 })
    if (!eligibilityLink) {
        return null
    }

    return {
        Data: {
            Eligibility: eligibilityLink.Eligibility,
            Fraud: eligibilityLink.Fraud,
            Reason: eligibilityLink.Reason,
            Gove: eligibilityLink.Gove,
        }
    }
}

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES = "2h"
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite"
const LLM_SYSTEM_PROMPT_BASE = `You are the official assistant for the Online Fuel Subsidy Eligibility System.

Your job is to help users only with tasks related to this system and the fuel subsidy process, including:
- applying for the fuel subsidy
- understanding fuel subsidy eligibility requirements as presented in this platform
- explaining what information or documents the user may need for the application
- helping users navigate pages and features in the system
- helping users use the map or location-related features inside this platform
- helping with login, password reset, OTP, and account access issues
- helping users understand application status, form fields, validation messages, and submission steps

Rules:
- Stay strictly within the scope of this fuel subsidy system.
- If the user asks about anything unrelated, reply exactly: not in my scope!
- Do not invent eligibility rules, government policy, approval criteria, benefits, or internal decisions.
- Only explain eligibility and requirements if they are provided or clearly reflected by this platform.
- If you are unsure, say so clearly and ask a short clarifying question.
- Give practical, step-by-step help when the user wants to complete a task.
- Keep answers concise, clear, and user-friendly.
- If the user seems confused, explain in simple words.
- Do not claim to have submitted, checked, changed, approved, or retrieved anything unless the system explicitly supports that action.
- Do not provide legal, financial, or policy advice beyond helping the user use this platform.

Behavior:
- For application questions, guide the user step by step through the fuel subsidy process in this system.
- When the user asks about application status, use only the applicant-facing eligibility context below. If no application result is available, tell them to apply first.
- If the applicant-facing status says the application needs further review, say only that it needs further review. Do not say the applicant is eligible or not eligible.
- If the applicant-facing status says not eligible and a reason is present, explain that reason in simple words. For example, if the reason is Salary, say the salary was too high for the model result.
- Never show raw eligibility context, field names, JSON, or numeric codes to the user.
- Never use the word fraud with applicants.
- For eligibility questions, explain only what the system shows or requires, and do not guess.
- For password or login issues, focus on the recovery steps supported by the platform.
- For map-related questions, help only with the map feature inside this system.
- When helpful, tell the user the next action they should take in the platform.`
const geminiClient = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null

function normalizeEligibilityResult(result) {
    if (!result) return null

    const data = result.Data || result
    const reviewRequired = data.Fraud === 1
    const eligibility = data.Eligibility ?? data.Eligibity ?? null
    const reason = data.Reason ?? data.reason ?? data.reson ?? null

    if (reviewRequired) {
        return {
            ApplicantStatus: "needs further review",
            ApplicantMessage: "Your application needs further review before a final status can be provided.",
            Reason: null,
            Gove: data.Gove ?? null,
        }
    }

    return {
        ApplicantStatus: eligibility === 1 ? "eligible" : eligibility === 0 ? "not eligible" : "unknown",
        ApplicantMessage: eligibility === 1
            ? "Your application is eligible."
            : eligibility === 0
                ? "Your application is not eligible."
                : "No final application status is available.",
        Reason: reason,
        Gove: data.Gove ?? null,
    }
}

function isApplicationStatusQuestion(text) {
    if (typeof text !== "string") return false

    const normalizedText = text.toLowerCase()

    return (
        normalizedText.includes("status") &&
        (
            normalizedText.includes("eligib") ||
            normalizedText.includes("application") ||
            normalizedText.includes("apply")
        )
    )
}

function formatEligibilityReason(reason) {
    if (typeof reason !== "string" || !reason.trim()) return null

    return reason
        .trim()
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase()
}

function buildApplicantStatusReply(eligibilityResult) {
    if (!eligibilityResult) {
        return "No application result is available yet. Please apply first."
    }

    if (eligibilityResult.ApplicantStatus === "needs further review") {
        return "Your application needs further review before a final status can be provided."
    }

    if (eligibilityResult.ApplicantStatus === "not eligible") {
        const reason = formatEligibilityReason(eligibilityResult.Reason)

        if (reason) {
            return `Your application is not eligible because your ${reason} is too high.`
        }

        return "Your application is not eligible."
    }

    if (eligibilityResult.ApplicantStatus === "eligible") {
        return "Your application is eligible."
    }

    return "No final application status is available."
}

async function buildEligibilityContext(userId) {
    const eligibilityResult = normalizeEligibilityResult(await getEligibilityResultForUser(userId))

    if (!eligibilityResult) {
        return "Current eligibility context: no application result is available yet."
    }

    const reasonText = eligibilityResult.ApplicantStatus === "not eligible" && eligibilityResult.Reason
        ? ` Explanation to include: ${eligibilityResult.Reason} is too high.`
        : ""

    return `Current applicant-facing application status: ${eligibilityResult.ApplicantMessage}${reasonText}`
}

async function buildSystemPrompt(userId) {
    return `${LLM_SYSTEM_PROMPT_BASE}

${await buildEligibilityContext(userId)}`
}

const DATE_PRESETS = new Set(["today", "last7", "last30", "thisMonth", "thisYear"])

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function startOfDay(date) {
    const nextDate = new Date(date)
    nextDate.setHours(0, 0, 0, 0)
    return nextDate
}

function startOfNextDay(date) {
    const nextDate = startOfDay(date)
    nextDate.setDate(nextDate.getDate() + 1)
    return nextDate
}

function buildDatePresetRange(datePreset) {
    if (!DATE_PRESETS.has(datePreset)) {
        return null
    }

    const now = new Date()
    let startDate
    let endDate = startOfNextDay(now)

    if (datePreset === "today") {
        startDate = startOfDay(now)
    } else if (datePreset === "last7") {
        startDate = startOfDay(now)
        startDate.setDate(startDate.getDate() - 6)
    } else if (datePreset === "last30") {
        startDate = startOfDay(now)
        startDate.setDate(startDate.getDate() - 29)
    } else if (datePreset === "thisMonth") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (datePreset === "thisYear") {
        startDate = new Date(now.getFullYear(), 0, 1)
    }

    return { $gte: startDate, $lt: endDate }
}

function addDatePresetFilter(query, datePreset) {
    const createdAt = buildDatePresetRange(datePreset)
    if (createdAt) {
        query.createdAt = createdAt
    }
    return query
}

function buildDatasetFilter(filters = {}) {
    return addDatePresetFilter({}, filters.datePreset)
}

function buildEligibilityFilter(filters = {}) {
    const query = addDatePresetFilter({}, filters.datePreset)
    const region = typeof filters.region === "string" ? filters.region.trim() : ""
    const status = typeof filters.status === "string" ? filters.status.trim() : ""

    if (region && region !== "all") {
        query.Gove = new RegExp(`^${escapeRegExp(region)}$`, "i")
    }

    if (status === "needs_review") {
        query.Fraud = 1
    } else if (status === "eligible") {
        query.Fraud = { $ne: 1 }
        query.Eligibility = 1
    } else if (status === "not_eligible") {
        query.Fraud = { $ne: 1 }
        query.Eligibility = 0
    }

    return query
}

function isEligibleRecord(record) {
    return record.Fraud !== 1 && record.Eligibility === 1
}

function isNotEligibleRecord(record) {
    return record.Fraud !== 1 && record.Eligibility === 0
}
//Connection to MongoDB
try {
    const subsidyApp_ConnectionString = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-lmvjits-shard-00-00.vndparp.mongodb.net:27017,ac-lmvjits-shard-00-01.vndparp.mongodb.net:27017,ac-lmvjits-shard-00-02.vndparp.mongodb.net:27017/${process.env.DB_Name}?ssl=true&replicaSet=atlas-drtwd2-shard-0&authSource=admin&appName=Cluster0;`
    await mongoose.connect(subsidyApp_ConnectionString);
    console.log("Connected to MongoDB");
} catch (error) {
    console.error("Error connecting to MongoDB:", error);
}

// Listener
subsidyApp.listen(PORT, () => {
    try {
        console.log(`Online Subsidy Eligibility System Server running at port ${PORT} ...!`)
    } catch (err) {
        console.log(err)
    }
})

subsidyApp.post("/llm/chat", async (req, res) => {
    if (!geminiClient) {
        return res.status(500).json({ serverMsg: "Gemini API key is missing on the server." })
    }

    const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : []
    const contents = rawMessages
        .filter((message) => typeof message?.content === "string" && message.content.trim())
        .map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content.trim() }],
        }))

    if (!contents.length) {
        return res.status(400).json({ serverMsg: "At least one message is required." })
    }

    try {
        const userId = typeof req.body?.userId === "string" ? req.body.userId : null
        const latestUserMessage = [...rawMessages].reverse().find((message) => message?.role === "user")
        const eligibilityResult = normalizeEligibilityResult(await getEligibilityResultForUser(userId))

        if (isApplicationStatusQuestion(latestUserMessage?.content)) {
            res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8")
            res.setHeader("Cache-Control", "no-cache")
            res.setHeader("Connection", "keep-alive")
            res.write(`${JSON.stringify({ message: { content: buildApplicantStatusReply(eligibilityResult) } })}\n`)
            return res.end()
        }

        const systemInstruction = await buildSystemPrompt(userId)

        res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        res.flushHeaders?.()

        const stream = await geminiClient.models.generateContentStream({
            model: GEMINI_MODEL,
            contents,
            config: {
                systemInstruction,
            },
        })

        for await (const chunk of stream) {
            if (!chunk.text) continue
            res.write(`${JSON.stringify({ message: { content: chunk.text } })}\n`)
        }

        res.end()
    } catch (error) {
        console.error("Gemini chat error:", error)

        if (!res.headersSent) {
            return res.status(500).json({ serverMsg: "Gemini request failed." })
        }

        res.write(`${JSON.stringify({ message: { content: "Error: Gemini request failed. Check the server API key and billing setup." } })}\n`)
        res.end()
    }
})

// Register a new priviliged user with encrypted password
// Note: Priviliged user registration is purely backend; there is no frontend for this (users cannot register as admins)
subsidyApp.post("/addPriv", async (req, res) => {
    try {
        const privExist = await PrivUserModel.findOne({ Email: req.body.Email })
        if (privExist) {
            res.json({ serverMsg: "Privileged user already exists!", flag: false })
        } else {
            const encryptedPassword = await bcrypt.hash(req.body.Password, 10)
            const newPriv = {
                Email: req.body.Email,
                Password: encryptedPassword,
                Type: req.body.Type
            }
            await PrivUserModel.create(newPriv)
            res.json({ serverMsg: "Privileged user Added Successfully!", flag: true })
        }
    } catch (err) {
        console.log(err)
    }
})

// Privileged user Login verification
subsidyApp.post("/loginPriv",
    audit("LOGIN_PRIV", {
        type: "Auth",
        id: req => req.body.Email
    }),
    async (req, res) => {
        try {
            const privExist = await PrivUserModel.findOne({ Email: req.body.Email })

            if (!privExist) {
                req.auditSuccess = false;
                res.json({ serverMsg: "Privileged user not found!", flag: false })

            } else {
                const matchPassword = await bcrypt.compare(req.body.Password, privExist.Password)
                req.auditActor = privExist._id.toString();

                if (!matchPassword) {
                    req.auditSuccess = false;
                    res.json({ serverMsg: "Incorrect Password!", flag: false })
                } else {
                    const token = jwt.sign(
                        { id: privExist._id, type: privExist.Type },
                        JWT_SECRET,
                        { expiresIn: JWT_EXPIRES }
                    )

                    req.auditSuccess = true;
                    res.json({ serverMsg: "Welcome", flag: true, token })
                }
            }
        } catch (err) {
            req.auditSuccess = false;
            console.log(err)
        }
    })

// Register a new user with encrypted password
subsidyApp.post("/addUser",
    audit("REGISTRATION", {
        type: "Applicant",
        id: req => req.body.Email
    }),
    async (req, res) => {
        try {
            const userExist = await UserModel.findOne({ Email: req.body.Email })
            if (userExist) {
                req.auditActor = userExist._id.toString();
                req.auditSuccess = false;
                res.json({ serverMsg: "User already exists!", flag: false })
            } else {
                const encryptedPassword = await bcrypt.hash(req.body.Password, 10)
                const newUser = {
                    Email: req.body.Email,
                    Phone: req.body.Phone,
                    Password: encryptedPassword
                }
                await UserModel.create(newUser)

                req.auditActor = newUser.Email;
                req.auditSuccess = true;
                res.json({ serverMsg: "Registration Success!", flag: true })
            }
        } catch (err) {
            req.auditSuccess = false;
            console.log(err)
        }
    })

// OTP
// Send OTP 
subsidyApp.post("/sendOtp",
    audit("SEND_OTP", {
        type: "Verification",
        id: req => req.body.Email
    }),
    async (req, res) => {
        req.auditActor = "SYSTEM"; // This action is initiated by the system

        const Email = req.body.Email;
        const use = req.body.use;
        const userExist = await UserModel.findOne({ Email })

        if (use === "Reg" && userExist) {
            req.auditSuccess = false;
            return res.json({ serverMsg: "Already Registered!", flag: false });
        }

        const otp = generateOtp();
        await saveOtp(otpModel, Email, otp);
        await sendOtpEmail(Email, otp);

        req.auditSuccess = true;

        res.json({ serverMsg: "OTP sent!", flag: true });
    });


// Verify OTP
subsidyApp.post("/verifyOtp",
    audit("VERIFY_OTP", {
        type: "Verification",
        id: req => req.body.Email
    }),
    async (req, res) => {
        req.auditActor = "SYSTEM";

        const Email = req.body.Email;
        const OTP = req.body.OTP;

        const result = await verifyOtp(otpModel, Email, OTP);

        if (result !== "success") {
            req.auditSuccess = false;
            return res.json({ serverMsg: result, flag: false });
        }

        req.auditSuccess = true;
        res.json({ serverMsg: "OTP verified!", flag: true });
    });

//Login verification
subsidyApp.post(
    "/loginUser",
    audit("LOGIN_APPLICANT", {
        type: "Auth",
        id: req => req.body.Email // temporary identifier
    }),
    async (req, res) => {
        try {
            const userEmail = req.body.Email;
            console.log('a')
            const userExist = await UserModel.findOne({ Email: userEmail });

            if (!userExist) {
                // mark failed attempt
                req.auditSuccess = false;
                return res.json({ serverMsg: "User not found !", flag: false });
            }

            // actor is known now
            req.auditActor = userExist._id.toString();

            const matchPassword = await bcrypt.compare(req.body.Password, userExist.Password);

            if (!matchPassword) {
                req.auditSuccess = false;
                return res.json({ serverMsg: "Incorrect Password!", flag: false });
            }

            const token = jwt.sign(
                { id: userExist._id, type: "User" },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES }
            );

            // mark success
            req.auditSuccess = true;
            res.json({ serverMsg: "Welcome", flag: true, token });

        } catch (err) {
            req.auditSuccess = false;
            console.log(err);
        }
    }
);

// Change Password
subsidyApp.put("/chgPassword",
    authAudit, // This will decode user authenticatication and attach user info to req.user
    audit("CHANGE_PASSWORD", {
        type: "User",
        id: req => req.user.id // use authenticated user's ID for logging
    }),
    async (req, res) => {
        try {
            let modelToUse
            switch (req.user.type) {
                case "User":
                    modelToUse = UserModel; break;
                case "Admin":
                    modelToUse = PrivUserModel; break;
                case "Regulator":
                    modelToUse = PrivUserModel; break;
                default:
                    throw new Error("Invalid user type");
            };
            const user = await modelToUse.findById(req.user.id);
            if (!user) {
                req.auditSuccess = false;
                return res.json({ serverMsg: "User not found !", flag: false })
            }
            const matchPassword = await bcrypt.compare(req.body.oldPassword, user.Password)

            if (!matchPassword) {
                req.auditSuccess = false;
                res.json({ serverMsg: "Incorrect Password!", flag: false })
            } else {
                const encryptedPassword = await bcrypt.hash(req.body.newPassword, 10)
                await modelToUse.findByIdAndUpdate(req.user.id, { Password: encryptedPassword })

                req.auditSuccess = true;
                res.json({ serverMsg: "Password changed successfully!", flag: true })
            }

        } catch (err) {
            req.auditSuccess = false;
            console.log(err)
        }
    })

// Forgot Password for Applicant
subsidyApp.put("/forgotPassword",
    audit("FORGOT_PASSWORD", {
        type: "User",
        id: req => req.body.Email
    }),
    async (req, res) => {
        try {
            const userEmail = req.body.Email
            let models = []
            const userExist = await UserModel.findOne({ Email: userEmail })
            if (userExist) {
                models.push(UserModel)
            }
            const privUserExist = await PrivUserModel.findOne({ Email: userEmail })
            if (privUserExist) {
                models.push(PrivUserModel)
            }
            if (!models) {
                req.auditSuccess = false;
                req.auditActor = "unknown";

                res.json({ serverMsg: "User not found !", flag: false })
            } else {
                const encryptedPassword = await bcrypt.hash(req.body.newPassword, 10)
                for (const model of models) {
                    await model.updateOne(
                        { Email: userEmail },
                        { Password: encryptedPassword }
                    )
                }

                req.auditSuccess = true;

                if (!models.length > 1) {
                    if (models[0] === UserModel) {
                        req.auditActor = userExist._id.toString();
                    } else {
                        req.auditActor = privUserExist._id.toString();
                    }
                } else {
                    req.auditActor = req.body.Email; // if user exists in both collections, use email as identifier
                }

                res.json({ serverMsg: "Password changed successfully!", flag: true })
            }
        } catch (err) {
            req.auditSuccess = false;
            console.log(err)
        }
    })

// Get Users
subsidyApp.get("/getUser",
    audit("GET_USERS", {
        type: "Applicant",
        id: req => "all_users"
    }),
    async (req, res) => {
        try {
            const userList = await UserModel.find()

            req.auditSuccess = true;
            req.auditActor = "SYSTEM";
            res.json({ serverMsg: "User list fetched successfully!", data: userList, flag: true })
        } catch (err) {
            req.auditSuccess = false;
            console.log(err)
        }
    })

// Get Privileged Users
subsidyApp.get("/getPrivUser", async (req, res) => {
    try {
        const pUserlist = await PrivUserModel.find()
        res.json({ serverMsg: "Privileged user list fetched successfully ", data: pUserlist, flag: true })
    } catch (e) {
        console.log(e)
    }

})

// Delete Applicant
subsidyApp.delete("/delUser/:id",
    authAudit,
    audit("DELETE_APPLICANT", {
        type: "Applicant",
        id: req => req.user.id
    }), async (req, res) => {
        try {
            await UserModel.deleteOne({ _id: req.params.id })

            req.auditSuccess = true;
            res.json({ serverMsg: "User Removed", flag: true })
        } catch (err) {
            req.auditSuccess = false;
            console.log(err)
        }
    })

// Update applicant Admin
subsidyApp.put("/upduser/:id",
    authAudit,
    audit("UPDATE_APPLICANT", { type: "Applicant", id: req => req.params.id }),
    async (req, res) => {
        try {
            const userExist = await UserModel.findOne({ _id: req.params.id })

            if (!userExist) {
                req.auditSuccess = false;
                return res.json({ serverMsg: "User not found!", flag: false })
            } else {
                req.auditSuccess = true;
                await UserModel.updateOne({ _id: req.params.id }, { $set: req.body })

                // identify changes for logging purposes
                let changes = {}
                for (const key of Object.keys(req.body)) {
                    if (key !== "_id") {
                        if (userExist[key] !== req.body[key]) {
                            changes[key] = { "Old": userExist[key], "New": req.body[key] }
                        }
                    }
                }
                req.changes = changes

                res.json({ serverMsg: "Account updated successfully", flag: true })
            }

        } catch (e) {
            req.auditSuccess = false;
            console.log(e)
            res.json({ serverMsg: "Update failed", flag: false })
        }
    })

// Get Audit Logs
subsidyApp.get("/getAuditLogs",
    audit("GET_AUDIT", { type: "Audit", id: req => "all_audits" }),
    async (req, res) => {
        try {
            req.auditActor = "SYSTEM";

            const logs = await AuditModel.find().sort({ createdAt: -1 })
            req.auditSuccess = true;
            res.json({ serverMsg: "Audit logs fetched successfully!", data: logs, flag: true })
        } catch (err) {
            req.auditSuccess = false;
            console.log(err)
        }
    })

//Add additon info
subsidyApp.post("/addmoreinfo", async (req, res) => {
    try {
        const userEmail = req.body.Email
        const userExist = UserModel.findOne({ Email: userEmail })
        if (userExist) {
            const newinfo = {
                Email: req.body.Email,
                NID: req.body.usernid,
                Vehicle_Ownership: req.body.Vehicle_Ownership,
                Cylinder_Count: req.body.Cylinder_Count,
            }
            await MLmodel.create(newinfo)
            res.json({ serverMsg: "New data added!", flag: true })

        } else {
            res.json({ serverMsg: "user not found!", flag: false })
        }
    } catch (e) {
        console.log(e)
    }
})

//Update additon info
subsidyApp.put("/updmoreinfo", async (req, res) => {
    try {
        const userEmail = req.body.Email
        const docexist = MLmodel.findOne({ Email: userEmail })
        if (docexist) {
            MLmodel.findOneandUpdate({ Email: userEmail }, {
                $set: {
                    NID: req.body.NID,
                    Vehicle_Ownership: req.body.Vehicle_Ownership,
                    Cylinder_Count: req.body.Cylinder_Count
                }
            })
            res.json({ serverMsg: "Updated data!", flag: true })

        } else {
            res.json({ serverMsg: "no data found for this user", flag: false })
        }
    } catch (e) {
        console.log(e)
    }
})

// Delete additon info
subsidyApp.delete("/delmoreinfo", async (req, res) => {
    try {
        const userEmail = req.body.Email
        const docexist = MLmodel.findOne({ Email: userEmail })
        if (docexist) {
            await MLmodel.deleteOne({ Email: userEmail })
            res.json({ serverMsg: "Deleted!", flag: true })

        } else {
            res.json({ serverMsg: "Error not found", flag: false })
        }
    } catch (e) {
        console.log(e)
    }
})

// view additon info
subsidyApp.get("/viewmoreinfo", async (req, res) => {
    try {
        const datalist = MLmodel.find()
        res.json({ serverMsg: "all data retived", data: datalist, flag: true })
    } catch (e) {
        console.log(e)
    }
})

// Search additon info
subsidyApp.get("/findmoreinfo", async (req, res) => {
    try {
        const userEmail = req.body.Email
        const docexist = findOne({ Email: userEmail })
        if (docexist) {
            res.json({ serverMsg: "data fount", data: docexist, flag: true })
        } else {
            res, json({ serverMsg: "data not found", flag: false })
        }
    } catch (e) {
        console.log(e)
    }
})

// ==================== DATASET MANAGEMENT ROUTES ====================

// Upload dataset (Regulator only)
subsidyApp.post("/uploadDataset",
    authAudit,
    audit("UPLOAD_DATASET", { type: "Dataset", id: req => req.user.id }),
    upload.single("dataset"),
    async (req, res) => {
        try {
            if (!req.file) {
                req.auditSuccess = false
                return res.json({ serverMsg: "No file uploaded", flag: false })
            }

            const uploader = await PrivUserModel.findById(req.user.id)
            if (!uploader || uploader.Type !== "Regulator") {
                req.auditSuccess = false
                return res.json({ serverMsg: "Only regulators can upload datasets", flag: false })
            }

            const content = req.file.buffer.toString("utf-8")
            const { rowCount, columnCount, columns } = parseCSV(content)

            const newDataset = {
                originalName: req.file.originalname,
                fileSize: req.file.size,
                uploadedBy: uploader.Email,
                uploaderId: req.user.id,
                rowCount,
                columnCount,
                columns,
                content,
                description: req.body.description || ""
            }

            await DatasetModel.create(newDataset)

            req.auditSuccess = true
            res.json({ serverMsg: "Dataset uploaded successfully", flag: true, data: { rowCount, columnCount, columns } })
        } catch (err) {
            req.auditSuccess = false
            console.log(err)
            res.json({ serverMsg: "Error uploading dataset", flag: false })
        }
    }
)

// Get all datasets (Admin and Regulator)
subsidyApp.get("/getDatasets",
    audit("GET_DATASETS", { type: "Dataset", id: req => "all_datasets" }),
    async (req, res) => {
        try {
            req.auditActor = "SYSTEM";
            const filters = buildDatasetFilter(req.query)
            const datasets = await DatasetModel.find(filters, { content: 0 }).sort({ createdAt: -1 })
            req.auditSuccess = true
            res.json({ serverMsg: "Datasets fetched", data: datasets, flag: true })
        } catch (err) {
            req.auditSuccess = false
            console.log(err)
            res.json({ serverMsg: "Error fetching datasets", flag: false })
        }
    }
)

// Get single dataset (Admin and Regulator)
subsidyApp.get("/getDataset/:id",
    authAudit,
    audit("GET_DATASET", { type: "Dataset", id: req => req.params.id }),
    async (req, res) => {
        try {
            const dataset = await DatasetModel.findById(req.params.id)
            if (!dataset) {
                req.auditSuccess = false
                return res.json({ serverMsg: "Dataset not found", flag: false })
            }
            req.auditSuccess = true
            res.json({ serverMsg: "Dataset fetched", data: dataset, flag: true })
        } catch (err) {
            req.auditSuccess = false
            console.log(err)
            res.json({ serverMsg: "Error fetching dataset", flag: false })
        }
    }
)

// Delete dataset (Regulator only)
subsidyApp.delete("/deleteDataset/:id",
    authAudit,
    audit("DELETE_DATASET", { type: "Dataset", id: req => req.params.id }),
    async (req, res) => {
        try {
            const requester = await PrivUserModel.findById(req.user.id)
            if (!requester || requester.Type !== "Regulator") {
                req.auditSuccess = false
                return res.json({ serverMsg: "Only regulators can delete datasets", flag: false })
            }

            const dataset = await DatasetModel.findById(req.params.id)
            if (!dataset) {
                req.auditSuccess = false
                return res.json({ serverMsg: "Dataset not found", flag: false })
            }
            await DatasetModel.deleteOne({ _id: req.params.id })
            req.auditSuccess = true
            res.json({ serverMsg: "Dataset deleted", flag: true })
        } catch (err) {
            req.auditSuccess = false
            console.log(err)
            res.json({ serverMsg: "Error deleting dataset", flag: false })
        }
    }
)

// Update dataset description (Regulator only)
subsidyApp.put("/updateDataset/:id",
    authAudit,
    audit("UPDATE_DATASET", { type: "Dataset", id: req => req.params.id }),
    async (req, res) => {
        try {
            const requester = await PrivUserModel.findById(req.user.id)
            if (!requester || requester.Type !== "Regulator") {
                req.auditSuccess = false
                return res.json({ serverMsg: "Only regulators can update datasets", flag: false })
            }

            const dataset = await DatasetModel.findById(req.params.id)
            if (!dataset) {
                req.auditSuccess = false
                return res.json({ serverMsg: "Dataset not found", flag: false })
            }
            await DatasetModel.updateOne({ _id: req.params.id }, { $set: { description: req.body.description } })
            req.auditSuccess = true
            res.json({ serverMsg: "Dataset updated", flag: true })
        } catch (err) {
            req.auditSuccess = false
            console.log(err)
            res.json({ serverMsg: "Error updating dataset", flag: false })
        }
    }
)

// Get dataset statistics (Admin only)
subsidyApp.get("/getDatasetStats",
    audit("GET_DATASET_STATS", { type: "Dataset", id: req => "dataset_stats" }),
    async (req, res) => {
        try {
            req.auditActor = "SYSTEM";
            const filters = buildDatasetFilter(req.query)
            const totalDatasets = await DatasetModel.countDocuments(filters)
            const totals = await DatasetModel.aggregate([
                { $match: filters },
                {
                    $group: {
                        _id: null,
                        totalSize: { $sum: "$fileSize" },
                        totalRows: { $sum: "$rowCount" }
                    }
                }
            ])

            req.auditSuccess = true
            res.json({
                serverMsg: "Statistics fetched",
                data: {
                    totalDatasets,
                    totalSize: totals[0]?.totalSize || 0,
                    totalRows: totals[0]?.totalRows || 0
                },
                flag: true
            })
        } catch (err) {
            req.auditSuccess = false
            console.log(err)
            res.json({ serverMsg: "Error fetching statistics", flag: false })
        }
    }
)

// For fraud flaging
// !! Is this not redudant now? handled by Eligibility Route !!
subsidyApp.put("/fruad/:id",
    audit("FLAG_FRAUD", { type: "Applicant", id: req => req.params.id }),
    async (req, res) => {
        try {
            req.auditActor = "SYSTEM"
            const userExist = await UserModel.findOne({ _id: req.params.id })
            if (!userExist) {
                req.auditSuccess = false
                res.json({ serverMsg: "User not found!", flag: false })
            } else {
                req.auditSuccess = true
                await UserModel.findOneAndUpdate({ _id: req.params.id }, { $set: { Fraud: req.body.Fraud } })
                return res.json({ serverMsg: "Update Successful!", flag: true });
            }
        } catch (e) {
            req.auditSuccess = false
            console.log(e)
        }
    })

subsidyApp.get("/Eligibility/:ID/:_id",
    audit("ELIGIBILITY_FLAG", { type: "Applicant", id: req => req.params.ID }),
    async (req, res) => {
        try {
            req.auditActor = req.params._id; // log by mongodb user ID
            const userExist = await UserModel.findOne({ _id: req.params._id })
            if (!userExist) {
                req.auditSuccess = false
                res.json({ serverMsg: "UserNotFound!", flag: false })
            } else {
                const docexist = await ELinkModel.findOne({ UserID: req.params._id })
                const civilIdInUse = await ELinkModel.findOne({ NationalID: req.params.ID })

                // No need to recheck elibility for user who already got result
                // Also check if civil ID is already used by another user to prevent fraud (one user cannot link with multiple civil IDs and one civil ID cannot link with multiple users)
                if (docexist) {
                    req.auditSuccess = true

                    const existingResult = {
                        Eligibity: docexist.Eligibility,
                        Fraud: docexist.Fraud,
                        Reason: docexist.Reason,
                        Gove: docexist.Gove
                    }
                    res.json({ serverMsg: "Eligibility result already received.", flag: true, Data: existingResult })

                } else if (civilIdInUse) {
                    req.auditSuccess = true

                    res.json({ serverMsg: "Civil ID already in use.", flag: false })

                } else {
                    req.auditSuccess = true
                    const mml = await fetch(`http://127.0.0.1:5000/EEml/${req.params.ID}/${req.params._id}`)
                    const data = await mml.json()
                    // Error handling for when ID not found
                    if (data.Eligibity === undefined) {
                        req.auditSuccess = false;
                        return res.json({
                            serverMsg: "An Error has occured",
                            flag: false
                        });
                    }
                    const eligibilityReason = data.Reason ?? data.reason ?? data.reson ?? null
                    data.Reason = eligibilityReason

                    switch (data.Eligibity) {
                        case 1:
                            if (data.Fraud === 1) {
                                sendFraudEmail(PrivUserModel, req.params.ID)
                                sendEligibilityEmail(userExist.Email, "Your case requires further review due to potential issues with your information.")
                            } else {
                                sendEligibilityEmail(userExist.Email, "Congratulations! You are eligible for the subsidy.");
                            }
                            break;
                        case 0:
                            if (data.Fraud === 1) {
                                sendFraudEmail(PrivUserModel, req.params.ID)
                                sendEligibilityEmail(userExist.Email, "Your case requires further review due to potential issues with your information.")
                            } else {
                                sendEligibilityEmail(userExist.Email, "We regret to inform you that you are not eligible for the subsidy."); break;
                            }
                    }

                    const newdata = {
                        UserID: req.params._id,
                        NationalID: req.params.ID,
                        Email: userExist.Email,
                        Fraud: data.Fraud,
                        Eligibility: data.Eligibity,
                        Reason: eligibilityReason,
                        Gove: data.Gove,
                        FraudReason: data.Fraudreson

                    }
                    await ELinkModel.create(newdata)
                    res.json({ serverMsg: "Success!", flag: true, Data: data })
                }
            }
        }
        catch (e) {
            req.auditSuccess = false
            console.log(e)
        }
    }

)

subsidyApp.get("/viewELlink", audit("GET_ELIGIBILITY", { type: "Applicant", id: req => "All_eligibility_info" }), async (req, res) => {
    try {

        const filters = buildEligibilityFilter(req.query)
        const elist = await ELinkModel.find(filters).sort({ createdAt: -1 }).lean()
        const userIds = elist
            .map(el => el.UserID)
            .filter(id => mongoose.Types.ObjectId.isValid(id))
        const users = await UserModel.find({ _id: { $in: userIds } }, { Phone: 1 }).lean()
        const phoneByUserId = users.reduce((phoneMap, user) => {
            phoneMap[user._id.toString()] = user.Phone
            return phoneMap
        }, {})
        const sanitizedList = elist.map(({ NationalID, ...eligibilityRecord }) => ({
            ...eligibilityRecord,
            Phone: phoneByUserId[eligibilityRecord.UserID] || "-"
        }))
        req.auditSuccess = true;
        req.auditActor = "SYSTEM";
        res.json({ serverMsg: "success", data: sanitizedList, flag: true })
    } catch (e) {
        req.auditSuccess = false
        console.log(e)
        res.json({ serverMsg: "Error fetching eligibility info", flag: false })
    }
})

subsidyApp.delete("/deleteELINK/:Email", audit("REMOVE_ELIGIBILITY", { type: "Applicant", id: req => req.params.Email }), async (req, res) => {
    try {
        const elist = await ELinkModel.deleteOne({ Email: req.params.Email })

        res.deletedCount
        req.auditSuccess = true;
        res.json({ serverMsg: "success", data: elist })
    } catch (e) {
        req.auditSuccess = false
        console.log(e)
    }
})

subsidyApp.delete("/deleteEligibility/:_id/:Email", authAudit, audit("REMOVE_ELIGIBILITY", { type: "Applicant", id: req => req.params._id }), async (req, res) => {
    try {
        const elist = await ELinkModel.findByIdAndDelete(req.params._id)

        res.deletedCount
        req.auditSuccess = true;
        sendEligibilityEmail(req.params.Email, "Your Eligibility Status Review has been Dismissed. You May Reapply")
        res.json({ serverMsg: "success", data: elist, flag: true })
    } catch (e) {
        req.auditSuccess = false
        console.log(e)
    }
})

subsidyApp.post("/createData",
    authAudit,
    audit("CREATE_SYNTHETIC_DATA", { type: "Dataset", id: req => req.user.id }),
    async (req, res) => {
        try {
            req.auditActor = req.user.id;

            if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
                req.auditSuccess = false;
                return res.status(400).json({ serverMsg: "Invalid synthetic data payload", flag: false });
            }
            let c = req.body.Conditions
            if (c === 0) {
                c = [[{ col: "Salary", op: "<=", value: 600 },
                { col: "Total_Household_Income", op: "<=", value: 900 },
                { col: "Vehicle_Ownership", op: "==", value: 1 }],
                [{ col: "Marital_Status", op: "==", value: 'Married' },
                { col: "Number_of_Children", op: ">=", value: 1 },
                { col: "Vehicle_Ownership", op: "==", value: 1 }],
                [{ col: "Age", op: "between", value: [18, 24] }
                    , { col: "Employment_Status", op: "isin", value: ['Student', 'Unemployed'] }
                    , { col: "Vehicle_Ownership", op: "==", value: 1 }]]

            }
            const condition = await ConditionModel.create({
                name: req.body.name || "synthetic_subsidy_cylinders",
                createdBy: req.user.username || req.user.id,
                creatorId: req.user.id,
                rowCount: req.body.rowCount || 0,
                fraud_fraction: req.body.fraud_fraction || 0,
                fraudmulti: req.body.fraudmulti || {},
                conditions: c,
            });

            const flaskPayload = {
                ...req.body,
                fruad_fraction: req.body.fraud_fraction,
                ...(req.body.fraudmulti ? { fruadmulti: req.body.fraudmulti } : {})
            };

            const response = await fetch("http://127.0.0.1:5000/synthic", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(flaskPayload)
            });

            const rawText = await response.text();
            let responseData;

            try {
                responseData = JSON.parse(rawText);
            } catch {
                responseData = { raw: rawText };
            }

            if (!response.ok) {
                req.auditSuccess = false;

                return res.status(response.status).json({
                    serverMsg: responseData.error || "Synthetic data generation failed",
                    flag: false,
                    data: responseData
                });
            }
            
            const rawContent = typeof responseData.Data === "string"
                ? responseData.Data
                : JSON.stringify(responseData.Data);

            let objects;
            try {
                objects = JSON.parse(rawContent);
            } catch (e) {
                throw new Error("Invalid JSON format: expected a JSON array");
            }

            if (!Array.isArray(objects)) {
                throw new Error("Expected data to be an array of objects");
            }

            // Row count = number of objects
            const rowCount = objects.length;

            // Collect unique keys (columns)
            const columnSet = new Set();
            objects.forEach(obj => {
                if (obj && typeof obj === "object" && !Array.isArray(obj)) {
                    Object.keys(obj).forEach(key => columnSet.add(key));
                }
            });

            const columns = Array.from(columnSet);
            const columnCount = columns.length;

            // Save dataset
            const dataset = await DatasetModel.create({
                originalName: (req.body.name || "synthetic_subsidy_cylinders") + ".csv",
                fileSize: Buffer.byteLength(rawContent, "utf8"),
                uploadedBy: req.user.username || req.user.id,
                uploaderId: req.user.id,
                rowCount,        
                columnCount,     
                columns,
                content: rawContent,
                description: req.body.description || "Synthetic dataset",
                conditionId: condition._id,
            });

            function formatConditions(conditions) {
                if (typeof condition === Object) {
                    return conditions
                        .map(group =>
                            group
                                .map(({ col, op, val }) => `${col} ${op} ${val}`)
                                .join(" AND ")
                        )
                        .join("\n");
                } else {
                    conditions = "Salary <= 600 and Total_Household_Income <= 900 and Vehicle_Ownership == 1 \n Marital_Status == 'Married' and Number_of_Children >= 1 and Vehicle_Ownership == 1 \n Age between(18, 24) and Employment_Status is in ['Student', 'Unemployed'] and Vehicle_Ownership == 1"

                }
            }

            const formatted = formatConditions(req.body.Conditions)
            req.auditSuccess = true;
            sendConditionEmail(PrivUserModel, `New codition has been made! the condition ID is: ${condition._id} \n Conditions are ${formatted}`)

            return res.json({
                serverMsg: "Synthetic data generated successfully",
                flag: true,
                data: responseData
            });
        }
        catch (e) {
            req.auditSuccess = false
            console.log(e)
            return res.status(500).json({
                serverMsg: "Unable to contact the synthetic data service at http://127.0.0.1:5000/synthic. Start it with: python \"synthetic data/mlserver.py\"",
                flag: false
            })
        }
    })
subsidyApp.post('/retrainEmodel',
    authAudit,
    audit("RETRAIN_ELIGIBILITY_MODEL", { type: "Model", id: req => req.user.id }),
    async (req, res) => {
        try {
            const requester = await PrivUserModel.findById(req.user.id)
            if (!requester || requester.Type !== "Regulator") {
                req.auditSuccess = false
                return res.status(403).json({ serverMsg: "Only regulators can retrain models", flag: false })
            }

            const activeDatasetSync = await syncActiveDatasetWithMl()
            if (!activeDatasetSync) {
                req.auditSuccess = false
                return res.status(400).json({
                    serverMsg: "Activate a dataset before retraining the eligibility model",
                    flag: false
                })
            }

            const response = await fetch(`${ML_SERVICE_URL}/trainE`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: activeDatasetSync.files.activeFile,
                    datasetId: activeDatasetSync.dataset._id.toString(),
                    originalName: activeDatasetSync.dataset.originalName
                })
            });


            const rawText = await response.text();
            let responseData;
            try {
                responseData = rawText ? JSON.parse(rawText) : {};
            } catch (parseError) {
                responseData = { raw: rawText };
            }


            if (response.ok && responseData.Data) {
                await DatasetModel.findByIdAndUpdate(
                    activeDatasetSync.dataset._id,
                    { $set: { content: JSON.stringify(responseData.Data) } }
                )
            }

            req.auditSuccess = response.ok;
            return res.status(response.ok ? 200 : response.status).json({
                serverMsg: response.ok
                    ? "Eligibility model retrained successfully"
                    : responseData.error || "Eligibility model retraining failed",
                flag: response.ok,
                data: {
                    ...responseData,
                    activeDataset: datasetSummary(activeDatasetSync.dataset),
                    mlFiles: activeDatasetSync.files,
                    mlServerDatasetSync: activeDatasetSync.mlServer
                }
            });
        } catch (e) {
            req.auditSuccess = false;
            console.log(e);
            return res.status(500).json({
                serverMsg: `Unable to contact the synthetic data service at ${ML_SERVICE_URL}/trainE. Start it with: python "synthetic data/mlserver.py"`,
                flag: false
            });
        }
    }
)

subsidyApp.post('/retrainImodel',
    authAudit,
    audit("RETRAIN_FRAUD_MODEL", { type: "Model", id: req => req.user.id }),
    async (req, res) => {
        try {
            const requester = await PrivUserModel.findById(req.user.id)
            if (!requester || requester.Type !== "Regulator") {
                req.auditSuccess = false
                return res.status(403).json({ serverMsg: "Only regulators can retrain models", flag: false })
            }

            const activeDatasetSync = await syncActiveDatasetWithMl()
            if (!activeDatasetSync) {
                req.auditSuccess = false
                return res.status(400).json({
                    serverMsg: "Activate a dataset before retraining the fraud model",
                    flag: false
                })
            }

            const response = await fetch(`${ML_SERVICE_URL}/trainI`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: activeDatasetSync.files.activeFile,
                    datasetId: activeDatasetSync.dataset._id.toString(),
                    originalName: activeDatasetSync.dataset.originalName
                })
            });

            const rawText = await response.text();
            let responseData;
            try {
                responseData = rawText ? JSON.parse(rawText) : {};
            } catch (parseError) {
                responseData = { raw: rawText };
            }

            req.auditSuccess = response.ok;
            return res.status(response.ok ? 200 : response.status).json({
                serverMsg: response.ok
                    ? "Fraud model retrained successfully"
                    : responseData.error || "Fraud model retraining failed",
                flag: response.ok,
                data: {
                    ...responseData,
                    activeDataset: datasetSummary(activeDatasetSync.dataset),
                    mlFiles: activeDatasetSync.files,
                    mlServerDatasetSync: activeDatasetSync.mlServer
                }
            });
        } catch (e) {
            req.auditSuccess = false;
            console.log(e);
            return res.status(500).json({
                serverMsg: `Unable to contact the synthetic data service at ${ML_SERVICE_URL}/trainI. Start it with: python "synthetic data/mlserver.py"`,
                flag: false
            });
        }
    }
)

subsidyApp.get("/eligibility_analytics", audit("GET_ANALYTICS", { type: "USER", id: req => "Analytics" }), async (req, res) => {
    try {
        const filters = buildEligibilityFilter(req.query)
        const data = await ELinkModel.find(filters);

        const totalApplicants = data.length;
        const eligibleCount = data.filter(isEligibleRecord).length;
        const ineligibleCount = data.filter(isNotEligibleRecord).length;
        const fraudCount = data.filter(d => d.Fraud === 1).length;
        const gov = data.map(d => d.Gove).filter(Boolean);
        const newdata = { "totalApplicants": totalApplicants, "eligibleCount": eligibleCount, "ineligibleCount": ineligibleCount, "fraudCount": fraudCount, 'gov': gov }
        res.json({ serverMsg: "Analytics fetched", data: newdata, flag: true })
    } catch (e) {
        console.log(e)
        res.json({ serverMsg: "Error fetching analytics", flag: false })
    }
})

subsidyApp.get("/eligibility_analytics/monthly", audit("GET_ANALYTICS_MONTHLY", { type: "USER", id: req => "Analytics" }), async (req, res) => {
    try {
        const filters = buildEligibilityFilter(req.query)
        const data = await ELinkModel.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    eligibleCount: { $sum: { $cond: [{ $and: [{ $ne: ["$Fraud", 1] }, { $eq: ["$Eligibility", 1] }] }, 1, 0] } },
                    ineligibleCount: { $sum: { $cond: [{ $and: [{ $ne: ["$Fraud", 1] }, { $eq: ["$Eligibility", 0] }] }, 1, 0] } },
                    fraudCount: { $sum: { $cond: [{ $eq: ["$Fraud", 1] }, 1, 0] } },
                    totalApplicants: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 7 }
        ]);

        res.json({ serverMsg: "Monthly analytics fetched", data, flag: true });
    } catch (e) {
        console.log(e);
        res.json({ serverMsg: "Error fetching monthly analytics", flag: false });
    }
});

subsidyApp.put("/changedata/:id",
    authAudit,
    audit("ACTIVATE_DATASET", { type: "Dataset", id: req => req.params.id }),
    async (req, res) => {
        try {
            const requester = await PrivUserModel.findById(req.user.id)
            if (!requester || requester.Type !== "Regulator") {
                req.auditSuccess = false
                return res.status(403).json({ serverMsg: "Only regulators can activate datasets", flag: false })
            }

            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                req.auditSuccess = false
                return res.status(400).json({ serverMsg: "Invalid dataset id", flag: false })
            }

            const dataset = await DatasetModel.findById(req.params.id)
            if (!dataset) {
                req.auditSuccess = false
                return res.status(404).json({ serverMsg: "Dataset not found", flag: false })
            }

            const mlSync = await syncDatasetWithMl(dataset)

            await DatasetModel.updateMany(
                { _id: { $ne: dataset._id } },
                { $set: { Active: false } }
            )

            const activatedDataset = await DatasetModel.findByIdAndUpdate(
                dataset._id,
                { $set: { Active: true } },
                { new: true, projection: { content: 0 } }
            )

            req.auditSuccess = true
            req.changes = {
                activatedDataset: dataset.originalName,
                wasActive: dataset.Active
            }

            res.json({
                serverMsg: mlSync.mlServer.synced
                    ? "Dataset activated and synced with the ML server"
                    : "Dataset activated. ML files were updated, but the ML server could not be notified.",
                data: {
                    ...activatedDataset.toObject(),
                    mlFiles: mlSync.files,
                    mlServerDatasetSync: mlSync.mlServer
                },
                flag: true
            })
        } catch (e) {
            req.auditSuccess = false
            console.log(e)
            res.status(500).json({ serverMsg: "Error activating dataset", flag: false })
        }
    }
)

subsidyApp.get('/vcondition', async (req, res) => {
    try {
        const a = await ConditionModel.find()
        res.json({ serverMsg: "Success", flag: true, a })

    } catch (e) {
        console.log(e)
    }
})

subsidyApp.delete('/delcondition', async (req, res) => {
    try {
        await ConditionModel.deleteMany()
        res.json({ serverMsg: "Success", flag: true, })

    } catch (e) {
        console.log(e)
    }
})



subsidyApp.put('/viewFruad', authAudit, audit("REGULATOR", { type: "REGULATOR", id: req => req.params.id }), async (req, res) => {
    try {
        await ELinkModel.findOneAndUpdate({ _id: req.body._id }, { Fraud: req.body.Fraud })
        const data = UserModel.findOne({ ID: req.body.ID })
        const status = await ELinkModel.findOne({ _id: req.body._id })
        if (status.Eligibility === 1) {
            sendEligibilityEmail(data.email, `Your your review haven been finsihed you are now eligible for the subsidy `)

            res.auditSuccess
            res.json({ serverMsg: 'Success', flag: true, data })
        } else {
            sendEligibilityEmail(data.email, `Your your review haven been finsihed you are now not eligible for the subsidy `)
            res.auditSuccess
            res.json({ serverMsg: 'Success', flag: true, data })
        }
    } catch (e) {
        console.log(e)
        res.json({ serverMsg: "Failed", flag: false })
    }
})

subsidyApp.get('/getAggregatedUserInfo', audit("GET_USERS_ELIGIBILITY", {
    type: "Applicant",
    id: req => "all_applicants_applied"
}), async (req, res) => {
    try {
        req.auditActor = "SYSTEM";
        const result = await UserModel.aggregate([
            {
                $lookup: {
                    from: "eligibility links",
                    localField: "Email",
                    foreignField: "Email",
                    as: "eligibilityInfo"
                }
            },
            {
                $unwind: {
                    path: "$eligibilityInfo",
                }
            }
        ]);
        req.auditSuccess = true;
        res.json({ serverMsg: "User Eligibility info fetched successfully!", data: result, flag: true })
    } catch (err) {
        req.auditSuccess = false;
        console.log(err)
    }
})

subsidyApp.get("/getConditions", audit("GET_RULES", {
    type: "Rules",
    id: req => "all_rules"
}), async (req, res) => {
    try {
        req.auditActor = "SYSTEM";
        const result = await ConditionModel.find().sort({ createdAt: -1 })

        req.auditSuccess = true;
        res.json({ serverMsg: "New Rules fetched successfully!", data: result, flag: true })
    } catch (err) {
        req.auditSuccess = false;
        console.log(err)
    }
})