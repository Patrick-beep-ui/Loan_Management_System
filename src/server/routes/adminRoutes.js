import express from "express";

import {
    createAdminUser,
    resetAdminUserPassword,
    updateAdminUser
} from "../controllers/adminUserController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const AdminRouter = express.Router();

AdminRouter.use(requireAdmin);

AdminRouter.route("/users")
    .post(createAdminUser); // POST /api/admin/users

AdminRouter.route("/users/:userId/reset-password")
    .post(resetAdminUserPassword); // POST /api/admin/users/:userId/reset-password

AdminRouter.route("/users/:userId")
    .patch(updateAdminUser); // PATCH /api/admin/users/:userId

export default AdminRouter;
