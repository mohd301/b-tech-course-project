import logAction from "./logAction.js";

function audit(action, targetResolver) {
  // This middleware will log the action after the response is sent
  return async (req, res, next) => {
    res.on("finish", async () => {
      const success = req.auditSuccess;
      await logAction({
        actorId: req.user?.id || req.auditActor || "unknown",
        action,
        targetType: targetResolver?.type,
        targetId: targetResolver?.id(req) || undefined,
        changes: req.changes || undefined,
        metadata: {
          route: req.originalUrl,
          method: req.method
        },
        ip: req.ip,
        result: success ? "success" : "failure"
      });
    });
    // passes control to the next middleware or route handler
    next();
  };
}

export default audit;