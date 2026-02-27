import auditModel from "../models/AuditModel.js";

async function logAction({ actorId, action, targetType, targetId, metadata, changes, ip, result }) {
  console.log("Logging action:", { actorId, action, targetType, targetId, metadata, changes, ip, result });
  await auditModel.create({
    actorId,
    action,
    targetType,
    targetId,
    changes,
    metadata,
    ip,
    result
  });
}

export default logAction;