import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        Email: { type: String, required: true },
        OTP: { type: String, required: true },
        Expiration: { type: Date, required: true, index: { expires: 0 } }
    },
    {
        versionKey: false
    }
)

const otpModel = new mongoose.model("otps", otpSchema)

export default otpModel