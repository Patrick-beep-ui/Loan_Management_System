import express from "express";
import {
    createInstallmentPayment,
    createInterestPayment,
    getAllPayments,
    getPaymentById
} from "../controllers/paymentController.js";

const PaymentRouter = express.Router();

PaymentRouter.route("/")
    .get(getAllPayments);

PaymentRouter.route("/installment")
    .post(createInstallmentPayment);

PaymentRouter.route("/interest")
    .post(createInterestPayment);

PaymentRouter.route("/:id")
    .get(getPaymentById);

export default PaymentRouter;
