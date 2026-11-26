import express from "express";
import {
    createLoan,
    deleteLoan,
    getAllLoans,
    getLoanById,
    replaceLoan,
    updateLoan
} from "../controllers/loanController.js";
import { requireAdminForLenderChange } from "../middlewares/requireAdminForLenderChange.js";

const LoanRouter = express.Router();

LoanRouter.route("/")
    .get(getAllLoans) // GET /api/loans
    .post(requireAdminForLenderChange, createLoan); // POST /api/loans

LoanRouter.route("/:id")
    .get(getLoanById) // GET /api/loans/:id
    .put(requireAdminForLenderChange, replaceLoan) // PUT /api/loans/:id (full replace)
    .patch(requireAdminForLenderChange, updateLoan) // PATCH /api/loans/:id (partial)
    .delete(deleteLoan); // DELETE /api/loans/:id

export default LoanRouter;