import mongoose from "mongoose";

const datasetSchema = new mongoose.Schema(
    {
        originalName: { type: String, required: true },
        fileSize: { type: Number, required: true },
        uploadedBy: { type: String, required: true },
        uploaderId: { type: String, required: true },
        rowCount: { type: Number, default: 0 },
        columnCount: { type: Number, default: 0 },
        columns: { type: [String], default: [] },
        content: { type: String, required: true },
        description: { type: String, default: "" }
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false
    }
)

const DatasetModel = new mongoose.model("datasets", datasetSchema)

export default DatasetModel
