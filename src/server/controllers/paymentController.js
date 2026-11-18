import {
    createInstallmentPayment as createInstallmentPaymentService,
    createInterestPayment as createInterestPaymentService,
    getAllPayments as getAllPaymentsService,
    getPaymentById as getPaymentByIdService
} from "../services/paymentService.js";
import { AppError } from "../utils/errors.js";

function handleError(res, error, context) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(`Error ${context}:`, error);
    return res.status(500).json({ error: "Internal Server Error" });
}

export async function getAllPayments(req, res) {
    try {
        const payments = await getAllPaymentsService(req.user, req.query.loan_id);
        return res.status(200).json(payments);
    } catch (error) {
        return handleError(res, error, "fetching payments");
    }
}

export async function getPaymentById(req, res) {
    try {
        const payment = await getPaymentByIdService(req.params.id, req.user);
        return res.status(200).json(payment);
    } catch (error) {
        return handleError(res, error, "fetching payment");
    }
}

export async function createInstallmentPayment(req, res) {
    try {
        const payment = await createInstallmentPaymentService(req.body, req.user);
        return res.status(201).json(payment);
    } catch (error) {
        return handleError(res, error, "creating installment payment");
    }
}

export async function createInterestPayment(req, res) {
    try {
        const payment = await createInterestPaymentService(req.body, req.user);
        return res.status(201).json(payment);
    } catch (error) {
        return handleError(res, error, "creating interest payment");
    }
}
