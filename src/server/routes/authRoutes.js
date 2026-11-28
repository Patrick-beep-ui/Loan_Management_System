import express from "express";
import { login, logout } from "../controllers/authController.js";
import { loginLimiter } from "../config/security.js";

const AuthRouter = express.Router();

AuthRouter.route("/login")
    .post(loginLimiter, login); // POST /api/auth/login

AuthRouter.route("/logout")
    .post(logout); // POST /api/auth/logout

export default AuthRouter;
