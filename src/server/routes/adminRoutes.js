import express from "express";

import { updateAdminUser } from "../controllers/adminUserController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const AdminRouter = express.Router();

AdminRouter.use(requireAdmin);

AdminRouter.route("/users/:userId")
    .patch(updateAdminUser);

export default AdminRouter;
