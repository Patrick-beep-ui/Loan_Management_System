import { login as loginService } from "../services/authService.js";
import { generateToken } from "../utils/generateToken.js";
import { AUTH_COOKIE_NAME, authCookieOptions } from "../utils/authCookie.js";
import { AppError } from "../utils/errors.js";

export async function login(req, res) {
    try {
        const user = await loginService(req.body);
        const token = generateToken(user);
        return res
            .cookie(AUTH_COOKIE_NAME, token, authCookieOptions())
            .status(200)
            .json({ user });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Error during login:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export function logout(req, res) {
    return res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions()).status(204).end();
}
