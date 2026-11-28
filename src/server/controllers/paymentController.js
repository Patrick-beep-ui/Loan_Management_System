import {
    createInstallmentPayment as createInstallmentPaymentService,
    createInterestPayment as createInterestPaymentService,
    deletePayment as deletePaymentService,
    getAllPayments as getAllPaymentsService,
    getPaymentById as getPaymentByIdService,
    updatePayment as updatePaymentService
} from "../services/paymentService.js";

export async function getAllPayments(req, res) {
    const payments = await getAllPaymentsService(req.user, req.query.loan_id);
    return res.status(200).json(payments);
}

export async function getPaymentById(req, res) {
    const payment = await getPaymentByIdService(req.params.id, req.user);
    return res.status(200).json(payment);
}

export async function createInstallmentPayment(req, res) {
    const payment = await createInstallmentPaymentService(req.body, req.user);
    return res.status(201).json(payment);
}

export async function createInterestPayment(req, res) {
    const payment = await createInterestPaymentService(req.body, req.user);
    return res.status(201).json(payment);
}

export async function updatePayment(req, res) {
    const payment = await updatePaymentService(req.params.id, req.body, req.user);
    return res.status(200).json(payment);
}

export async function deletePayment(req, res) {
    await deletePaymentService(req.params.id, req.user);
    return res.status(204).end();
}
