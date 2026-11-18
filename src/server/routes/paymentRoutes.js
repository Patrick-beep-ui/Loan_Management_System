import express from "express";
import {
    createInstallmentPayment,
    createInterestPayment,
    deletePayment,
    getAllPayments,
    getPaymentById,
    updatePayment
} from "../controllers/paymentController.js";

const PaymentRouter = express.Router();

PaymentRouter.route("/")
    .get(getAllPayments);

PaymentRouter.route("/installment")
    .post(createInstallmentPayment);

PaymentRouter.route("/interest")
    .post(createInterestPayment);

PaymentRouter.route("/:id")
    .get(getPaymentById)
    .patch(updatePayment)
    .delete(deletePayment);

export default PaymentRouter;
