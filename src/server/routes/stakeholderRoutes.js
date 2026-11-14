import express from "express";
import {
    createStakeholder,
    deleteStakeholder,
    getAllStakeholders,
    getStakeholderById,
    replaceStakeholder,
    updateStakeholder
} from "../controllers/stakeholderController.js";

const StakeholderRouter = express.Router();

StakeholderRouter.route("/")
    .get(getAllStakeholders) // GET /api/stakeholders
    .post(createStakeholder); // POST /api/stakeholders

StakeholderRouter.route("/:id")
    .get(getStakeholderById) // GET /api/stakeholders/:id
    .put(replaceStakeholder) // PUT /api/stakeholders/:id (full replace)
    .patch(updateStakeholder) // PATCH /api/stakeholders/:id (partial)
    .delete(deleteStakeholder); // DELETE /api/stakeholders/:id

export default StakeholderRouter;
