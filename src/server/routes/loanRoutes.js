import express from "express";
import {
    createLoan,
    deleteLoan,
    getAllLoans,
    getLoanById,
    replaceLoan,
    updateLoan
} from "../controllers/loanController.js";

const LoanRouter = express.Router();

LoanRouter.route("/")
    .get(getAllLoans) // GET /api/loans
    .post(createLoan); // POST /api/loans

LoanRouter.route("/:id")
    .get(getLoanById) // GET /api/loans/:id
    .put(replaceLoan) // PUT /api/loans/:id (full replace)
    .patch(updateLoan) // PATCH /api/loans/:id (partial)
    .delete(deleteLoan); // DELETE /api/loans/:id

export default LoanRouter;