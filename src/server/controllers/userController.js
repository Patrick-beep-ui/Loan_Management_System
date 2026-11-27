import { getAllUsers as getAllUsersService, authUser as authUserService } from "../services/userService.js";
import { changePassword as changePasswordService } from "../services/authService.js";
import { AppError } from "../utils/errors.js";

export async function getAllUsers(req, res) {
    try {
        const users = await getAllUsersService();
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function authUser(req, res) {
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await authUserService(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error authenticating user:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function changePassword(req, res) {
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const result = await changePasswordService(userId, req.body);
        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Error changing password:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
