import {
    createLoan as createLoanService,
    deleteLoan as deleteLoanService,
    getAllLoans as getAllLoansService,
    getLoanById as getLoanByIdService,
    replaceLoan as replaceLoanService,
    updateLoan as updateLoanService
} from "../services/loanService.js";
import { AppError } from "../utils/errors.js";

function handleError(res, error, context) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(`Error ${context}:`, error);
    return res.status(500).json({ error: "Internal Server Error" });
}

export async function getAllLoans(req, res) {
    try {
        const loans = await getAllLoansService();
        return res.status(200).json(loans);
    } catch (error) {
        return handleError(res, error, "fetching loans");
    }
}

export async function getLoanById(req, res) {
    try {
        const loan = await getLoanByIdService(req.params.id);
        return res.status(200).json(loan);
    } catch (error) {
        return handleError(res, error, "fetching loan");
    }
}

export async function createLoan(req, res) {
    try {
        const loan = await createLoanService(req.body);
        return res.status(201).json(loan);
    } catch (error) {
        return handleError(res, error, "creating loan");
    }
}

export async function replaceLoan(req, res) {
    try {
        const loan = await replaceLoanService(req.params.id, req.body);
        return res.status(200).json(loan);
    } catch (error) {
        return handleError(res, error, "replacing loan");
    }
}

export async function updateLoan(req, res) {
    try {
        const loan = await updateLoanService(req.params.id, req.body);
        return res.status(200).json(loan);
    } catch (error) {
        return handleError(res, error, "updating loan");
    }
}

export async function deleteLoan(req, res) {
    try {
        await deleteLoanService(req.params.id);
        return res.status(204).send();
    } catch (error) {
        return handleError(res, error, "deleting loan");
    }
}