import express from "express";
import { login, signup } from "../controllers/authController.js";

const AuthRouter = express.Router();

AuthRouter.route("/signup")
    .post(signup); // POST /api/auth/signup

AuthRouter.route("/login")
    .post(login); // POST /api/auth/login

export default AuthRouter;
