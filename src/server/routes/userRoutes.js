import express from "express";
import { getAllUsers, authUser, changePassword } from "../controllers/userController.js";

const UserRouter = express.Router();

UserRouter.route("/")
    .get(getAllUsers); // GET /api/users

UserRouter.route("/auth")
    .get(authUser); // GET /api/users/auth

UserRouter.route("/me/password")
    .patch(changePassword); // PATCH /api/users/me/password

export default UserRouter;
