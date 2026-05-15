import mongoose from "mongoose";
const conditionSchema = new mongoose.Schema(
    {
        name: { type: String, default: "synthetic_subsidy_cylinders" },
        createdBy: { type: String, required: true },
        creatorId: { type: String, required: true },
        rowCount: { type: Number, default: 0 },
        fraud_fraction: { type: Number, default: 0 },
        fraudmulti: { type: mongoose.Schema.Types.Mixed, default: {} },
        conditions: { type: mongoose.Schema.Types.Mixed, default: {} }, // stores the full req.body
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false
    }
)

const ConditionModel = mongoose.model("conditions", conditionSchema);
export default ConditionModel;