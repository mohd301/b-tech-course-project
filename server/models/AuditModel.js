import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  actorId: { type: String, required: true },
  action: { type: String, required: true },
  targetType: { type: String },
  targetId: { type: String },
  changes: { type: Object },
  metadata: { type: Object },
  ip: { type: String },
  result: { type: String, required: true }
},
{
    createdAt: true,
    versionKey: false
});

const auditModel = mongoose.model("auditlogs", auditLogSchema);
export default auditModel;
