export function requireAdmin(req, res, next) {
    if (req.user?.role_name !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }

    return next();
}
