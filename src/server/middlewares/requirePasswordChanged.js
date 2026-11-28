const ALLOWED_PATHS = new Set(["/users/auth", "/users/me/password"]);

export function requirePasswordChanged(req, res, next) {
    if (!req.user?.must_change_password) {
        return next();
    }

    if (ALLOWED_PATHS.has(req.path)) {
        return next();
    }

    return res.status(403).json({ error: "Password change required" });
}
