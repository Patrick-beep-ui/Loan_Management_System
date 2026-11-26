import express from "express";

import { requireAdmin } from "../middlewares/requireAdmin.js";

const AdminRouter = express.Router();

AdminRouter.use(requireAdmin);

export default AdminRouter;
