import {
    createLoan as createLoanService,
    deleteLoan as deleteLoanService,
    getAllLoans as getAllLoansService,
    getLoanById as getLoanByIdService,
    replaceLoan as replaceLoanService,
    updateLoan as updateLoanService
} from "../services/loanService.js";

export async function getAllLoans(req, res) {
    const loans = await getAllLoansService(req.user);
    return res.status(200).json(loans);
}

export async function getLoanById(req, res) {
    const loan = await getLoanByIdService(req.params.id, req.user);
    return res.status(200).json(loan);
}

export async function createLoan(req, res) {
    const loan = await createLoanService(req.body, req.user);
    return res.status(201).json(loan);
}

export async function replaceLoan(req, res) {
    const loan = await replaceLoanService(req.params.id, req.body, req.user);
    return res.status(200).json(loan);
}

export async function updateLoan(req, res) {
    const loan = await updateLoanService(req.params.id, req.body, req.user);
    return res.status(200).json(loan);
}

export async function deleteLoan(req, res) {
    await deleteLoanService(req.params.id, req.user);
    return res.status(204).send();
}
