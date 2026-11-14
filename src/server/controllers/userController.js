import { getAllUsers as getAllUsersService } from "../services/userService.js";

export async function getAllUsers(req, res) {
    try {
        const users = await getAllUsersService();
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
