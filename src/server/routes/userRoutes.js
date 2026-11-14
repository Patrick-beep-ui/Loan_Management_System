import express from "express";
import { getAllUsers } from "../controllers/userController.js";

const UserRouter = express.Router();

UserRouter.route("/")
    .get(getAllUsers); // GET /api/users

export default UserRouter;
