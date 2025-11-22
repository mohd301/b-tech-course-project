import mongoose from "mongoose";

const privSchema = new mongoose.Schema(
    {
        Email: { type: String, required: true },
        Password: { type: String, required: true },
        Type: { type: String, enum:["Admin","Regulator"], required: true }
    },
    {
        versionKey: false
    }
)

const PrivUserModel = new mongoose.model("privilegedUsers", privSchema)

export default PrivUserModel