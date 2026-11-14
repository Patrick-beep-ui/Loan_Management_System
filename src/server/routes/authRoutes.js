import express from "express";
import { signup } from "../controllers/authController.js";

const AuthRouter = express.Router();

AuthRouter.route("/signup")
    .post(signup); // POST /api/auth/signup

export default AuthRouter;
