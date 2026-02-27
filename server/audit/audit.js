import jwt from "jsonwebtoken";

import logAction from "./logAction.js";

function audit(action, targetResolver) {
  return async (req, res, next) => {
    res.on("finish", async () => {
      // if an action required authentication we should get a token
      const token = req.headers?.authorization?.split(" ")[1];
      let decodedToken = {};
      if (token) {
        decodedToken = jwt.verify(token.toString(), process.env.JWT_SECRET);
      }
      const success = req.auditSuccess;
      await logAction({
        actorId: decodedToken.id || req.auditActor || "anonymous",
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

    next();
  };
}

export default audit;