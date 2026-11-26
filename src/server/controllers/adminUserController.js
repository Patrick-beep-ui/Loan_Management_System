import { updateAdminUser as updateAdminUserService } from "../services/adminUserService.js";
import { AppError } from "../utils/errors.js";

function handleError(res, error, context) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(`Error ${context}:`, error);
    return res.status(500).json({ error: "Internal Server Error" });
}

export async function updateAdminUser(req, res) {
    try {
        const user = await updateAdminUserService(req.params.userId, req.body);
        return res.status(200).json(user);
    } catch (error) {
        return handleError(res, error, "updating admin user");
    }
}
