import connection from "../config/connection.js";
import Loan from "../models/Loan.js";
import LoanCollateral from "../models/LoanCollateral.js";
import LoanGuarantor from "../models/LoanGuarantor.js";
import LoanInstallment from "../models/LoanInstallment.js";
import LoanInterestPayment from "../models/LoanInterestPayment.js";
import LoanPayment from "../models/LoanPayment.js";
import InstallmentPayment from "../models/InstallmentPayment.js";
import Stakeholder from "../models/Stakeholder.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import {
    buildCreateLoanPayload,
    buildPartialLoanPayload,
    buildReplaceLoanPayload,
    parseLoanId
} from "../utils/validators/loanValidation.js";

const stakeholderAttributes = ["stakeholder_id", "first_name", "last_name"];
const paymentAttributes = ["payment_id", "amount", "paid_at", "recorded_by"];

const loanIncludes = [
    { model: Stakeholder, as: "lender", attributes: stakeholderAttributes },
    { model: Stakeholder, as: "customer", attributes: stakeholderAttributes },
    {
        model: LoanInstallment,
        as: "installments",
        separate: true,
        order: [["installment_number", "ASC"]]
    },
    {
        model: LoanGuarantor,
        as: "guarantors",
        separate: true,
        include: [
            {
                model: Stakeholder,
                as: "guarantor",
                attributes: stakeholderAttributes
            }
        ]
    },
    {
        model: LoanCollateral,
        as: "collaterals",
        separate: true
    },
    {
        model: LoanInterestPayment,
        as: "interestPayment",
        include: [
            {
                model: LoanPayment,
                attributes: paymentAttributes
            }
        ]
    }
];

function handleConstraintError(error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
        throw new ConflictError("Loan references an invalid or related record");
    }

    if (error.name === "SequelizeUniqueConstraintError") {
        const fields = [
            ...(error.errors?.map((item) => item.path) ?? []),
            ...Object.keys(error.fields ?? {})
        ];

        if (fields.some((field) => field?.includes("national_id"))) {
            throw new ConflictError("A stakeholder with that national ID already exists");
        }

        throw new ConflictError("A related record already exists");
    }

    throw error;
}

async function findLoanOrThrow(loan_id, transaction) {
    const loan = await Loan.findByPk(loan_id, {
        include: loanIncludes,
        transaction
    });

    if (!loan) {
        throw new NotFoundError("Loan not found");
    }

    return loan;
}

async function assertNoPayments(loan_id, transaction) {
    const installments = await LoanInstallment.findAll({
        where: { loan_id },
        attributes: ["installment_id"],
        raw: true,
        transaction
    });

    if (installments.length > 0) {
        const paymentCount = await InstallmentPayment.count({
            where: {
                installment_id: installments.map((installment) => installment.installment_id)
            },
            transaction
        });

        if (paymentCount > 0) {
            throw new ConflictError("Loan has installment payments and cannot be changed");
        }
    }

    const paidInterest = await LoanInterestPayment.findOne({
        where: { loan_id, status: "paid" },
        transaction
    });

    if (paidInterest) {
        throw new ConflictError("Loan has paid interest and cannot be changed");
    }
}

async function writeChildren(loan_id, payload, transaction) {
    if (payload.guarantors !== undefined) {
        await LoanGuarantor.destroy({ where: { loan_id }, transaction });

        const stakeholderIds = [];

        for (const guarantor of payload.guarantors) {
            if (guarantor.stakeholder_id !== undefined) {
                const stakeholder = await Stakeholder.findByPk(guarantor.stakeholder_id, {
                    transaction
                });

                if (!stakeholder) {
                    throw new ConflictError("guarantor_stakeholder_id does not exist");
                }

                stakeholderIds.push(stakeholder.stakeholder_id);
                continue;
            }

            const stakeholder = await Stakeholder.create(guarantor.stakeholder, {
                transaction
            });
            stakeholderIds.push(stakeholder.stakeholder_id);
        }

        await LoanGuarantor.bulkCreate(
            stakeholderIds.map((stakeholder_id) => ({
                loan_id,
                guarantor_stakeholder_id: stakeholder_id
            })),
            { transaction }
        );
    }

    if (payload.installments !== undefined) {
        await LoanInstallment.destroy({ where: { loan_id }, transaction });
        await LoanInstallment.bulkCreate(
            payload.installments.map((installment) => ({
                ...installment,
                loan_id,
                interest_rate: payload.terms.interest_rate,
                status: "pending"
            })),
            { transaction }
        );
    }

    if (payload.collaterals !== undefined) {
        await LoanCollateral.destroy({ where: { loan_id }, transaction });
        await LoanCollateral.bulkCreate(
            payload.collaterals.map((collateral) => ({
                ...collateral,
                loan_id
            })),
            { transaction }
        );
    }

    if (payload.loan.interest_payment_mode !== undefined) {
        const interestPayment = await LoanInterestPayment.findOne({
            where: { loan_id },
            transaction
        });

        if (payload.loan.interest_payment_mode === "included") {
            if (interestPayment?.status === "paid") {
                throw new ConflictError(
                    "A paid interest record cannot be removed by changing interest_payment_mode"
                );
            }

            if (interestPayment) {
                await interestPayment.destroy({ transaction });
            }
        } else if (!interestPayment) {
            await LoanInterestPayment.create(
                {
                    loan_id,
                    payment_id: null,
                    status: "pending"
                },
                { transaction }
            );
        }
    }
}

export async function getAllLoans() {
    return await Loan.findAll({
        include: loanIncludes,
        order: [["loan_id", "DESC"]]
    });
}

export async function getLoanById(id) {
    const loan_id = parseLoanId(id);
    return await findLoanOrThrow(loan_id);
}

export async function createLoan(data = {}) {
    const payload = buildCreateLoanPayload(data);

    try {
        const loan_id = await connection.transaction(async (transaction) => {
            const loan = await Loan.create(payload.loan, { transaction });
            await writeChildren(loan.loan_id, payload, transaction);
            return loan.loan_id;
        });

        return await findLoanOrThrow(loan_id);
    } catch (error) {
        handleConstraintError(error);
    }
}

export async function replaceLoan(id, data = {}) {
    const loan_id = parseLoanId(id);
    const payload = buildReplaceLoanPayload(data);

    try {
        await connection.transaction(async (transaction) => {
            const loan = await findLoanOrThrow(loan_id, transaction);
            await assertNoPayments(loan_id, transaction);
            await loan.update(payload.loan, { transaction });
            await writeChildren(loan_id, payload, transaction);
        });

        return await findLoanOrThrow(loan_id);
    } catch (error) {
        handleConstraintError(error);
    }
}

export async function updateLoan(id, data = {}) {
    const loan_id = parseLoanId(id);
    const currentLoan = await findLoanOrThrow(loan_id);
    const payload = buildPartialLoanPayload(data, currentLoan);

    try {
        await connection.transaction(async (transaction) => {
            if (payload.financialChanges || payload.installments !== undefined) {
                await assertNoPayments(loan_id, transaction);
            }

            if (Object.keys(payload.loan).length > 0) {
                await currentLoan.update(payload.loan, { transaction });
            }

            await writeChildren(loan_id, payload, transaction);
        });

        return await findLoanOrThrow(loan_id);
    } catch (error) {
        handleConstraintError(error);
    }
}

export async function deleteLoan(id) {
    const loan_id = parseLoanId(id);

    try {
        await connection.transaction(async (transaction) => {
            const loan = await findLoanOrThrow(loan_id, transaction);
            await assertNoPayments(loan_id, transaction);
            await LoanInterestPayment.destroy({ where: { loan_id }, transaction });
            await LoanGuarantor.destroy({ where: { loan_id }, transaction });
            await LoanCollateral.destroy({ where: { loan_id }, transaction });
            await LoanInstallment.destroy({ where: { loan_id }, transaction });
            await loan.destroy({ transaction });
        });
    } catch (error) {
        handleConstraintError(error);
    }
}
