export function requireAdminForLenderChange(req, res, next) {
    if (req.user?.role_name === "admin") {
        return next();
    }

    const lenderId = req.body?.lender_id;

    if (lenderId === undefined) {
        return next();
    }

    const parsedLenderId = Number(lenderId);

    if (
        !Number.isFinite(parsedLenderId) ||
        parsedLenderId === Number(req.user?.stakeholder_id)
    ) {
        return next();
    }

    return res.status(403).json({ error: "Only admins can change the lender" });
}
