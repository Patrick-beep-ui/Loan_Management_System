import express from "express";
import { getAllRoles } from "../controllers/roleController.js";

const RoleRouter = express.Router();

RoleRouter.route("/")
    .get(getAllRoles); // GET /api/roles

export default RoleRouter;
