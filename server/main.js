import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import UserModel from "./models/UserModel.js"
import PrivUserModel from "./models/PrivUserModel.js"
import otpModel from "./models/OtpModel.js"
import { generateOtp, sendOtpEmail, saveOtp, verifyOtp } from "./otp.js"

const subsidyApp = new express()
subsidyApp.use(express.json())
subsidyApp.use(cors())

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
subsidyApp.post("/loginPriv", async (req, res) => {
    try {
        const privExist = await PrivUserModel.findOne({ Email: req.body.Email })
        if (!privExist) {
            res.json({ serverMsg: "Privileged user not found!", flag: false })
        } else {
            const matchPassword = await bcrypt.compare(req.body.Password, privExist.Password)
            if (!matchPassword) {
                res.json({ serverMsg: "Incorrect Password!", flag: false })
            } else {
                const token = jwt.sign(
                    { id: privExist._id, type: privExist.Type },
                    JWT_SECRET,
                    { expiresIn: JWT_EXPIRES }
                )
                res.json({ serverMsg: "Welcome", flag: true, token })
            }
        }
    } catch (err) {
        console.log(err)
    }
})

// Register a new user with encrypted password
subsidyApp.post("/addUser", async (req, res) => {
    try {
        const userExist = await UserModel.findOne({ Email: req.body.Email })
        if (userExist) {
            res.json({ serverMsg: "User already exists!", flag: false })
        } else {
            const encryptedPassword = await bcrypt.hash(req.body.Password, 10)
            const newUser = {
                Email: req.body.Email,
                Phone: req.body.Phone,
                Password: encryptedPassword
            }
            await UserModel.create(newUser)
            res.json({ serverMsg: "Registration Success!", flag: true })
        }
    } catch (err) {
        console.log(err)
    }
})

// OTP
// Send OTP 
subsidyApp.post("/sendOtp", async (req, res) => {
    const Email = req.body.Email;
    const userExist = await UserModel.findOne({Email})
    
    if(userExist){
        return res.json({ serverMsg: "Already Registered!", flag: true });
    }

    const otp = generateOtp();
    await saveOtp(otpModel, Email, otp);
    await sendOtpEmail(Email, otp);

    res.json({ serverMsg: "OTP sent!", flag: true });
});


// Verify OTP
subsidyApp.post("/verifyOtp", async (req, res) => {
    const Email = req.body.Email;
    const OTP = req.body.OTP;

    const result = await verifyOtp(otpModel, Email, OTP);

    if (result !== "success") {
        return res.json({ serverMsg: result, flag: false });
    }

    res.json({ serverMsg: "OTP verified!", flag: true });
});

//Login verification
subsidyApp.post("/loginUser", async (req, res) => {
    try {
        const userEmail = req.body.Email
        const userExist = await UserModel.findOne({ Email: userEmail })
        if (!userExist) {
            res.json({ serverMsg: "User not found !", flag: false })
        } else {
            const matchPassword = await bcrypt.compare(req.body.Password, userExist.Password)
            if (!matchPassword) {
                res.json({ serverMsg: "Incorrect Password!", flag: false })
            } else {
                const token = jwt.sign(
                    { id: userExist._id, type: "User" },
                    JWT_SECRET,
                    { expiresIn: JWT_EXPIRES }
                )
                // Might add user details in future
                res.json({ serverMsg: "Welcome", user: userExist.Email, flag: true, token })
            }
        }
    } catch (err) {
        console.log(err)
    }
})

// Change Password for User
subsidyApp.put("/chgPassword", async (req, res) => {
    try {
        const userEmail = req.body.Email
        const userExist = await UserModel.findOne({ Email: userEmail })
        if (!userExist) {
            res.json({ serverMsg: "User not found !", flag: false })
        } else {
            const matchPassword = await bcrypt.compare(req.body.oldPassword, userExist.Password)
            if (!matchPassword) {
                res.json({ serverMsg: "Incorrect Password!", flag: false })
            } else {
                const encryptedPassword = await bcrypt.hash(req.body.newPassword, 10)
                await UserModel.updateOne(
                    { Email: userEmail },
                    { Password: encryptedPassword }
                )
                res.json({ serverMsg: "Password changed successfully!", flag: true })
            }
        }
    } catch (err) {
        console.log(err)
    }
})

// Get Users
subsidyApp.get("/getUser", async (req, res) => {
    try {
        const userList = await UserModel.find()
        res.json({ serverMsg: "User list fetched successfully!", data: userList, flag: true })
    } catch (err) {
        console.log(err)
    }
})

// Get Privileged Users
subsidyApp.get("/getPrivUser", async (req, res) => {
    try {
        const pUserlist = await PrivUserModel.find()
        res.json({ serverMsg: "Private user list fetched successfully ", data: pUserlist, flag: true })
    } catch (e) {
        console.log(e)
    }

})

// Delete User
subsidyApp.delete("/delUser", async (req, res) => {
    try {
        await UserModel.deleteOne({ Email: req.body.Email })
        res.json({ serverMsg: "User Removed", flag: true })
    } catch (err) {
        console.log(err)
    }
})