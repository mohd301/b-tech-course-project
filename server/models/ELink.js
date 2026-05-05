import mongoose from "mongoose";

const ELinkSchema = new mongoose.Schema(
    {
        Email: { type: String, required: true },
        UserID: { type: String, required: true },
        NationalID: { type: String, required: true },
        Fraud: { type: Number, required: true, default: 0 },
        Eligibility:{type:Number,required:true},
        Reason:{type:String,required:false},
        Gove:{type:String,required:true}
    },
    {
        versionKey: false
    }
)

const ELinkModel = new mongoose.model("eligibility link", ELinkSchema)

export default ELinkModel