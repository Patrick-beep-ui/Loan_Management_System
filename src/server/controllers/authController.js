import { signup as signupService } from "../services/authService.js";
import { AppError } from "../utils/errors.js";

export async function signup(req, res) {
    try {
        const user = await signupService(req.body);
        return res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error("Error during signup:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
