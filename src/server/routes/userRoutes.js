import express from "express";
import { getAllUsers, authUser } from "../controllers/userController.js";

const UserRouter = express.Router();

UserRouter.route("/")
    .get(getAllUsers); // GET /api/users

UserRouter.route("/auth")
.get(authUser); // GET /api/users/auth

export default UserRouter;
