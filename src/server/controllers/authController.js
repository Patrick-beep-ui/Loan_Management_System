import { login as loginService } from "../services/authService.js";
import { generateToken } from "../utils/generateToken.js";
import { AUTH_COOKIE_NAME, authCookieOptions } from "../utils/authCookie.js";

export async function login(req, res) {
    const user = await loginService(req.body);
    const token = generateToken(user);
    return res
        .cookie(AUTH_COOKIE_NAME, token, authCookieOptions())
        .status(200)
        .json({ user });
}

export function logout(req, res) {
    return res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions()).status(204).end();
}
