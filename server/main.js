import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import multer from "multer"

import UserModel from "./models/UserModel.js"
import PrivUserModel from "./models/PrivUserModel.js"
import otpModel from "./models/OtpModel.js"
import MLmodel from "./models/MlModel.js"
import AuditModel from "./models/AuditModel.js"
import DatasetModel from "./models/DatasetModel.js"
import ELinkModel from "./models/ELink.js"

import audit from "./audit/audit.js"
import authAudit from "./audit/authAudit.js"
import parseCSV from "./functions/parseCSV.js"

import { generateOtp, sendOtpEmail, saveOtp, verifyOtp, sendFraudEmail } from "./email.js"

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

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES = "1h"

//Connection to MongoDB
try {
    const subsidyApp_ConnectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vndparp.mongodb.net/${process.env.DB_NAME}`;
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
        type: "User",
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
    audit("LOGIN", {
        type: "Auth",
        id: req => req.body.Email // temporary identifier
    }),
    async (req, res) => {
        try {
            const userEmail = req.body.Email;
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

// Change Password for User
subsidyApp.put("/chgPassword",
    authAudit, // This will decode user authenticatication and attach user info to req.user
    audit("CHANGE_PASSWORD_USER", {
        type: "User",
        id: req => req.user.id // use authenticated user's ID for logging
    }),
    async (req, res) => {
        try {
            const user = await UserModel.findById(req.user.id)
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
                await UserModel.findByIdAndUpdate(req.user.id, { Password: encryptedPassword })

                req.auditSuccess = true;
                res.json({ serverMsg: "Password changed successfully!", flag: true })
            }

        } catch (err) {
            req.auditSuccess = false;
            console.log(err)
        }
    })

// Forgot Password for User
subsidyApp.put("/forgotPassword",
    audit("FORGOT_PASSWORD_USER", {
        type: "User",
        id: req => req.body.Email
    }),
    async (req, res) => {
        try {
            const userEmail = req.body.Email
            const userExist = await UserModel.findOne({ Email: userEmail })
            if (!userExist) {
                req.auditSuccess = false;
                req.auditActor = "unknown";

                res.json({ serverMsg: "User not found !", flag: false })
            } else {
                const encryptedPassword = await bcrypt.hash(req.body.newPassword, 10)
                await UserModel.updateOne(
                    { Email: userEmail },
                    { Password: encryptedPassword }
                )

                req.auditSuccess = true;
                req.auditActor = userExist._id.toString();
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
        type: "User",
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

// Delete User
subsidyApp.delete("/delUser/:id",
    authAudit,
    audit("DELETE_USER", {
        type: "User",
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

// Update user Admin
subsidyApp.put("/upduser/:id",
    authAudit,
    audit("UPDATE_USER", { type: "User", id: req => req.params.id }),
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
            const datasets = await DatasetModel.find({}, { content: 0 }).sort({ createdAt: -1 })
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
            const totalDatasets = await DatasetModel.countDocuments()
            const totalSize = await DatasetModel.aggregate([{ $group: { _id: null, totalSize: { $sum: "$fileSize" } } }])
            const totalRows = await DatasetModel.aggregate([{ $group: { _id: null, totalRows: { $sum: "$rowCount" } } }])

            req.auditSuccess = true
            res.json({
                serverMsg: "Statistics fetched",
                data: {
                    totalDatasets,
                    totalSize: totalSize[0]?.totalSize || 0,
                    totalRows: totalRows[0]?.totalRows || 0
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
subsidyApp.put("/fruad/:id",
    audit("FLAG_FRAUD", { type: "User", id: req => req.params.id }),
    async (req, res) => {
        try {
            req.auditActor = "SYSTEM"
            const userExist = await UserModel.findOne({ _id: req.params.id })
            if (!userExist) {
                req.auditSuccess = false
                res.json({ serverMsg: "User not found!", flag: false })
            } else {
                req.auditSuccess = true
                sendFraudEmail(PrivUserModel, req.params.id)
                await UserModel.findOneAndUpdate({ _id: req.params.id }, { $set: { Fraud: req.body.Fraud } })
                return res.json({ serverMsg: "Update Successful!", flag: true });
            }
        } catch (e) {
            req.auditSuccess = false
            console.log(e)
        }
    })
subsidyApp.get("/Eligibility/:ID/:_id",
    audit("Eligibility_flag", { type: "User", id: req => req.params.ID }), // fixed to correct parameter
    async (req, res) => {
        try {
            req.auditActor = req.params._id; // log by mongodb user ID
            const userExist = await UserModel.findOne({ _id: req.params._id })
            if (!userExist) {
                req.auditSuccess = false
                res.json({ serverMsg: "UserNotFound!", flag: false })
            } else {
                const docexist = await ELinkModel.findOne({ UserID: req.params._id })

                if (docexist) {
                     req.auditSuccess = true
                    const mml = await fetch(`http://127.0.0.1:5000/EEml/${req.params.ID}/${req.params._id}`) // was missing http://
                    const data = await mml.json()
                    console.log("A")
                    console.log(data)

                    await ELinkModel.findOneAndUpdate({ UserID: req.params._id }, {
                        $set: {
                            NationalID: req.params.ID,
                            Email: userExist.Email, // Fixed to use found user email
                            Fraud: data.Fraud,
                            Eligibility: data.Eligibity
                        }
                    })
                    console.log("b")
                    res.json({ serverMsg: "Success!", flag: true, Data: data })
                    console.log(data)

                } else {
                    req.auditSuccess = true
                    const mml = await fetch(`http://127.0.0.1:5000/EEml/${req.params.ID}/${req.params._id}`) // was missing http://
                    const data = await mml.json()

                    const newdata = {
                        UserID: req.params._id,
                        NationalID: req.params.ID,
                        Email: userExist.Email, // Fixed to use found user email
                        Fraud: data.Fraud,
                        Eligibility: data.Eligibity

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