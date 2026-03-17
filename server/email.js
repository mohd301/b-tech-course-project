import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import bcrypt from "bcrypt"
dotenv.config();

// ## OTP Functions ##

// Create email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});


// Generate a 4-digit OTP 
export const generateOtp = () => {
    return crypto.randomInt(1000, 9999).toString();
};


// Send OTP to email
export const sendOtpEmail = async (email, otp) => {
    return transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
    });
};


// Save OTP to MongoDB and encrypt it
export const saveOtp = async (otpModel, Email, OTP) => {
    const expiration = Date.now() + 5 * 60 * 1000; // Date.now() gives milliseconds
    const hashedOTP = await bcrypt.hash(OTP.toString(), 10)
    await otpModel.updateOne(
        { Email },
        { $set: { OTP: hashedOTP, Expiration: expiration } }, // $set operator to update fields which change
        { upsert: true }    // Create document if it doesn't exist, else update existing
    );
};

// Verify OTP
export const verifyOtp = async (otpModel, Email, OTP) => {
    const record = await otpModel.findOne({ Email });

    if (!record) return "No OTP found";
    if (Date.now() > record.Expiration) return "OTP expired";

    const cleanOtp = OTP.toString().trim();
    const result = await bcrypt.compare(cleanOtp, record.OTP)
    if (!result) return "Invalid OTP";

    // Delete after successful verification
    await otpModel.deleteOne({ Email });

    return "success";
};

// ## Other Email Functions ##

export const sendFraudEmail = async (regModel, id) => {
    const regs = await regModel.find()
    for (let reg of regs) {
        transporter.sendMail({
            from: process.env.EMAIL,
            to: reg.Email,
            subject: "Fraud Alert",
            text: `A potential fraud case has been detected for user with ID: ${id}`
        });
    }
}

export const sendEligibilityEmail = async (applicantEmail, msg) => {
    transporter.sendMail({
        from: process.env.EMAIL,
        to: applicantEmail,
        subject: "Eligibility Status",
        text: msg
    });
}