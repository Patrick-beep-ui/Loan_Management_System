import jwt from "jsonwebtoken";

export function checkAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            user_id: payload.user_id,
            role_id: payload.role_id,
            role_name: payload.role_name,
            stakeholder_id: payload.stakeholder_id
        };
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
