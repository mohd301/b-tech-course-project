import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        Email: { type: String, required: true },
        Phone: { type: Number, required: true },
        Password: { type: String, required: true },
        Fruad:{type:Number,required:true,default:0}
        

    },
    {
        versionKey: false
    }
)

const UserModel = new mongoose.model("users", userSchema)

export default UserModel