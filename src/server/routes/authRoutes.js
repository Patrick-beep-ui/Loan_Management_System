import express from "express";
import { login } from "../controllers/authController.js";

const AuthRouter = express.Router();

AuthRouter.route("/login")
    .post(login); // POST /api/auth/login

export default AuthRouter;
