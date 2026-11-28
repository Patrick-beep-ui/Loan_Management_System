import { getAllUsers as getAllUsersService, authUser as authUserService } from "../services/userService.js";
import { changePassword as changePasswordService } from "../services/authService.js";
import { NotFoundError, UnauthorizedError } from "../utils/errors.js";

export async function getAllUsers(req, res) {
    const users = await getAllUsersService();
    return res.status(200).json(users);
}

export async function authUser(req, res) {
    const userId = req.user?.user_id;
    if (!userId) {
        throw new UnauthorizedError("Unauthorized");
    }

    const user = await authUserService(userId);
    if (!user) {
        throw new NotFoundError("User not found");
    }

    return res.status(200).json(user);
}

export async function changePassword(req, res) {
    const userId = req.user?.user_id;
    if (!userId) {
        throw new UnauthorizedError("Unauthorized");
    }

    const result = await changePasswordService(userId, req.body);
    return res.status(200).json(result);
}
