import jwt from "jsonwebtoken";

export function generateToken({ user_id, role_id }) {
    return jwt.sign(
        { user_id, role_id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );
}
