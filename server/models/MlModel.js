import mongoose from "mongoose";


const mlscheama = new mongoose.Schema({
    Email:{type: String, required: true},
    NID:{Type:Number,required:true},
    Vehicle_Ownership:{type:Boolean,required:true},
    Cylinder_Count:{type:Number,required:true}

})
const MLmodel = new mongoose.model("ML",mlscheama)
export default MLmodel