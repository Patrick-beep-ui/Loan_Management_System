import connection from "../config/connection.js";
import InstallmentPayment from "../models/InstallmentPayment.js";
import Loan from "../models/Loan.js";
import LoanInstallment from "../models/LoanInstallment.js";
import LoanInterestPayment from "../models/LoanInterestPayment.js";
import LoanPayment from "../models/LoanPayment.js";
import User from "../models/User.js";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors.js";
import { parsePositiveInteger } from "../utils/validators/common.js";
import {
    buildCreateInstallmentPaymentPayload,
    buildCreateInterestPaymentPayload,
    buildUpdatePaymentPayload,
    parsePaymentId
} from "../utils/validators/paymentValidation.js";
import { loanScope } from "./loanService.js";

const paymentIncludes = [
    { model: User, as: "recordedBy", attributes: ["user_id", "email"] },
    {
        model: InstallmentPayment,
        include: [
            {
                model: LoanInstallment,
                attributes: ["installment_id", "installment_number", "loan_id", "status"]
            }
        ]
    },
    {
        model: LoanInterestPayment,
        include: [{ model: Loan, attributes: ["loan_id"] }]
    }
];

function sameAmount(left, right) {
    return Math.round(Number(left) * 100) === Math.round(Number(right) * 100);
}

function handleConstraintError(error) {
    if (
        error.name === "SequelizeForeignKeyConstraintError" ||
        error.name === "SequelizeUniqueConstraintError"
    ) {
        throw new ConflictError("Payment conflicts with an existing record");
    }

    throw error;
}

async function findAccessibleLoan(loan_id, user, transaction) {
    const loan = await Loan.findOne({
        where: { loan_id, ...loanScope(user) },
        transaction
    });

    if (!loan) {
        throw new NotFoundError("Loan not found");
    }

    return loan;
}

async function findPaymentOrThrow(payment_id, user, transaction) {
    const payment = await LoanPayment.findByPk(payment_id, {
        include: paymentIncludes,
        transaction
    });

    if (!payment) {
        throw new NotFoundError("Payment not found");
    }

    const loan_id =
        payment.InstallmentPayment?.LoanInstallment?.loan_id ??
        payment.LoanInterestPayment?.loan_id;

    if (!loan_id) {
        throw new NotFoundError("Payment not found");
    }

    await findAccessibleLoan(loan_id, user, transaction);

    return payment;
}

async function runPaymentTransaction(payload, user, recordPayment) {
    try {
        return await connection.transaction(async (transaction) => {
            const loan = await findAccessibleLoan(payload.loan_id, user, transaction);
            const payment = await recordPayment(payload, loan, user, transaction);

            return await findPaymentOrThrow(payment.payment_id, user, transaction);
        });
    } catch (error) {
        handleConstraintError(error);
    }
}

async function runPaymentByIdTransaction(id, user, operate) {
    const payment_id = parsePaymentId(id);

    try {
        return await connection.transaction(async (transaction) => {
            const payment = await findPaymentOrThrow(payment_id, user, transaction);
            return await operate(payment, transaction);
        });
    } catch (error) {
        handleConstraintError(error);
    }
}

async function recordInstallmentPayment(payload, loan, user, transaction) {
    const installment = await LoanInstallment.findOne({
        where: {
            installment_id: payload.installment_id,
            loan_id: loan.loan_id
        },
        transaction
    });

    if (!installment) {
        throw new NotFoundError("Installment not found for this loan");
    }

    const paymentCount = await InstallmentPayment.count({
        where: { installment_id: installment.installment_id },
        transaction
    });

    if (installment.status === "paid" || paymentCount > 0) {
        throw new ConflictError("Installment is already paid");
    }

    if (!sameAmount(payload.amount, installment.amount_due)) {
        throw new ValidationError("amount must equal the installment amount due");
    }

    const payment = await LoanPayment.create(
        {
            amount: payload.amount,
            paid_at: payload.paid_at,
            recorded_by: user.user_id
        },
        { transaction }
    );

    await InstallmentPayment.create(
        {
            payment_id: payment.payment_id,
            installment_id: installment.installment_id
        },
        { transaction }
    );

    await installment.update({ status: "paid" }, { transaction });

    return payment;
}

async function recordInterestPayment(payload, loan, user, transaction) {
    const interest = await LoanInterestPayment.findOne({
        where: {
            loan_interest_payment_id: payload.loan_interest_payment_id,
            loan_id: loan.loan_id
        },
        transaction
    });

    if (!interest) {
        throw new NotFoundError("Interest payment not found for this loan");
    }

    if (loan.interest_payment_mode !== "separate") {
        throw new ConflictError("Interest payments require interest_payment_mode separate");
    }

    if (interest.status === "paid" || interest.payment_id !== null) {
        throw new ConflictError("Interest is already paid");
    }

    if (!sameAmount(payload.amount, loan.interest_amount)) {
        throw new ValidationError("amount must equal the interest due");
    }

    const payment = await LoanPayment.create(
        {
            amount: payload.amount,
            paid_at: payload.paid_at,
            recorded_by: user.user_id
        },
        { transaction }
    );

    await interest.update(
        {
            payment_id: payment.payment_id,
            status: "paid"
        },
        { transaction }
    );

    return payment;
}

export async function getAllPayments(user, loanId) {
    const parsedLoanId =
        loanId === undefined || loanId === null || loanId === ""
            ? null
            : parsePositiveInteger(loanId, "loan_id");

    let loanIds;

    if (parsedLoanId) {
        await findAccessibleLoan(parsedLoanId, user);
        loanIds = [parsedLoanId];
    } else {
        const loans = await Loan.findAll({
            where: loanScope(user),
            attributes: ["loan_id"],
            raw: true
        });
        loanIds = loans.map((loan) => loan.loan_id);
    }

    if (loanIds.length === 0) {
        return [];
    }

    const installments = await LoanInstallment.findAll({
        where: { loan_id: loanIds },
        attributes: ["installment_id"],
        raw: true
    });
    const installmentIds = installments.map((installment) => installment.installment_id);

    const [installmentPayments, interestPayments] = await Promise.all([
        installmentIds.length > 0
            ? InstallmentPayment.findAll({
                  where: { installment_id: installmentIds },
                  attributes: ["payment_id"],
                  raw: true
              })
            : [],
        LoanInterestPayment.findAll({
            where: { loan_id: loanIds, status: "paid" },
            attributes: ["payment_id"],
            raw: true
        })
    ]);

    const paymentIds = [
        ...installmentPayments.map((payment) => payment.payment_id),
        ...interestPayments
            .filter((payment) => payment.payment_id !== null)
            .map((payment) => payment.payment_id)
    ];

    if (paymentIds.length === 0) {
        return [];
    }

    return await LoanPayment.findAll({
        where: { payment_id: [...new Set(paymentIds)] },
        include: paymentIncludes,
        order: [
            ["paid_at", "DESC"],
            ["payment_id", "DESC"]
        ]
    });
}

export async function getPaymentById(id, user) {
    const payment_id = parsePaymentId(id);
    return await findPaymentOrThrow(payment_id, user);
}

export async function createInstallmentPayment(data = {}, user) {
    const payload = buildCreateInstallmentPaymentPayload(data);
    return await runPaymentTransaction(payload, user, recordInstallmentPayment);
}

export async function createInterestPayment(data = {}, user) {
    const payload = buildCreateInterestPaymentPayload(data);
    return await runPaymentTransaction(payload, user, recordInterestPayment);
}

export async function updatePayment(id, data = {}, user) {
    const payload = buildUpdatePaymentPayload(data);

    return await runPaymentByIdTransaction(id, user, async (payment, transaction) => {
        await payment.update({ paid_at: payload.paid_at }, { transaction });
        return await findPaymentOrThrow(payment.payment_id, user, transaction);
    });
}

export async function deletePayment(id, user) {
    return await runPaymentByIdTransaction(id, user, async (payment, transaction) => {
        if (payment.InstallmentPayment) {
            await InstallmentPayment.destroy({
                where: { payment_id: payment.payment_id },
                transaction
            });
            await LoanInstallment.update(
                { status: "pending" },
                {
                    where: {
                        installment_id: payment.InstallmentPayment.installment_id
                    },
                    transaction
                }
            );
        } else {
            await LoanInterestPayment.update(
                { payment_id: null, status: "pending" },
                { where: { payment_id: payment.payment_id }, transaction }
            );
        }

        await LoanPayment.destroy({
            where: { payment_id: payment.payment_id },
            transaction
        });
    });
}
