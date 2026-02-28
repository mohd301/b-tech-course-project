import jwt from "jsonwebtoken";

export default function authAudit(req, res, next) {
    try {
        // if an action required authentication we should get a token
        const token = req.headers?.authorization?.split(" ")[1];
        const decodedToken = jwt.verify(token.toString(), process.env.JWT_SECRET);
        req.user = decodedToken; // Attach user info to request for later use (such as in audit logs)
        return next();
    } catch (err) {
        console.log("Auth audit error:", err);
    }

}