import express from "express";
import {
    createStakeholder,
    deleteStakeholder,
    getAllStakeholders,
    getStakeholderById,
    replaceStakeholder,
    updateStakeholder
} from "../controllers/stakeholderController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const StakeholderRouter = express.Router();

StakeholderRouter.route("/")
    .get(getAllStakeholders) // GET /api/stakeholders
    .post(requireAdmin, createStakeholder); // POST /api/stakeholders

StakeholderRouter.route("/:id")
    .get(getStakeholderById) // GET /api/stakeholders/:id
    .put(requireAdmin, replaceStakeholder) // PUT /api/stakeholders/:id (full replace)
    .patch(requireAdmin, updateStakeholder) // PATCH /api/stakeholders/:id (partial)
    .delete(requireAdmin, deleteStakeholder); // DELETE /api/stakeholders/:id

export default StakeholderRouter;
