import jwt from "jsonwebtoken";

import Role from "../models/Role.js";
import User from "../models/User.js";
import { readAuthCookie } from "../utils/authCookie.js";

export async function checkAuth(req, res, next) {
    const token = readAuthCookie(req);

    if (!token) {
        return res.status(401).json({ error: "Authentication required" });
    }

    let payload;

    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }

    try {
        const user = await User.findByPk(payload.user_id, {
            attributes: ["user_id", "role_id", "stakeholder_id", "is_active", "must_change_password"],
            include: [{ model: Role, attributes: ["role_name"] }]
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        if (user.is_active === false || user.is_active === 0) {
            return res.status(401).json({ error: "Account is inactive" });
        }

        req.user = {
            user_id: user.user_id,
            role_id: user.role_id,
            role_name: user.Role?.role_name ?? null,
            stakeholder_id: user.stakeholder_id,
            must_change_password: Boolean(user.must_change_password)
        };
        return next();
    } catch (error) {
        console.error("Error authenticating request:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
