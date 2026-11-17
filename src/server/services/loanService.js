import connection from "../config/connection.js";
import Loan from "../models/Loan.js";
import LoanCollateral from "../models/LoanCollateral.js";
import LoanGuarantor from "../models/LoanGuarantor.js";
import LoanInstallment from "../models/LoanInstallment.js";
import LoanInterestPayment from "../models/LoanInterestPayment.js";
import LoanPayment from "../models/LoanPayment.js";
import InstallmentPayment from "../models/InstallmentPayment.js";
import Stakeholder from "../models/Stakeholder.js";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors.js";
import {
    assertDistinctStakeholders,
    assertInstallmentTotals,
    assertInterestPaymentMode,
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

const financialFields = [
    "loan_amount",
    "interest_rate",
    "interest_payment_mode"
];

function handleConstraintError(error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
        throw new ConflictError("Loan references an invalid or related record");
    }

    if (error.name === "SequelizeUniqueConstraintError") {
        const fields = error.errors?.map((item) => item.path) ??
            Object.keys(error.fields ?? {});

        if (fields.includes("national_id")) {
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

async function getLoanWithRelations(loan_id) {
    return await findLoanOrThrow(loan_id);
}

async function resolveGuarantorIds(guarantors, transaction) {
    const stakeholderIds = [];

    for (const guarantor of guarantors) {
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

    if (new Set(stakeholderIds).size !== stakeholderIds.length) {
        throw new ValidationError("guarantors must not contain duplicate stakeholders");
    }

    return stakeholderIds;
}

async function createInstallments(
    loan_id,
    installments,
    interest_rate,
    transaction
) {
    await LoanInstallment.bulkCreate(
        installments.map((installment) => ({
            ...installment,
            loan_id,
            interest_rate,
            status: "pending"
        })),
        { transaction }
    );
}

async function createGuarantorLinks(loan_id, guarantors, transaction) {
    const stakeholderIds = await resolveGuarantorIds(guarantors, transaction);

    await LoanGuarantor.bulkCreate(
        stakeholderIds.map((stakeholder_id) => ({
            loan_id,
            guarantor_stakeholder_id: stakeholder_id
        })),
        { transaction }
    );
}

async function createCollaterals(loan_id, collaterals, transaction) {
    await LoanCollateral.bulkCreate(
        collaterals.map((collateral) => ({
            ...collateral,
            loan_id
        })),
        { transaction }
    );
}

async function ensureInterestPayment(loan_id, interest_payment_mode, transaction) {
    const interestPayment = await LoanInterestPayment.findOne({
        where: { loan_id },
        transaction
    });

    if (interest_payment_mode === "included") {
        if (interestPayment?.status === "paid") {
            throw new ConflictError(
                "A paid interest record cannot be removed by changing interest_payment_mode"
            );
        }

        if (interestPayment) {
            await interestPayment.destroy({ transaction });
        }

        return;
    }

    if (!interestPayment) {
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

async function assertNoInstallmentPayments(loan_id, transaction) {
    const installments = await LoanInstallment.findAll({
        where: { loan_id },
        attributes: ["installment_id"],
        raw: true,
        transaction
    });

    if (installments.length === 0) {
        return;
    }

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

async function assertNoPaidInterest(loan_id, transaction) {
    const paidInterest = await LoanInterestPayment.findOne({
        where: { loan_id, status: "paid" },
        transaction
    });

    if (paidInterest) {
        throw new ConflictError("Loan has paid interest and cannot be changed");
    }
}

async function assertNoPayments(loan_id, transaction) {
    await assertNoInstallmentPayments(loan_id, transaction);
    await assertNoPaidInterest(loan_id, transaction);
}

async function createLoanChildren(loan_id, payload, transaction) {
    await createGuarantorLinks(loan_id, payload.guarantors, transaction);
    await createInstallments(
        loan_id,
        payload.installments,
        payload.loan.interest_rate,
        transaction
    );
    await createCollaterals(loan_id, payload.collaterals, transaction);
    await ensureInterestPayment(
        loan_id,
        payload.loan.interest_payment_mode,
        transaction
    );
}

async function replaceInstallments(loan_id, installments, interest_rate, transaction) {
    await LoanInstallment.destroy({ where: { loan_id }, transaction });
    await createInstallments(loan_id, installments, interest_rate, transaction);
}

async function replaceGuarantors(loan_id, guarantors, transaction) {
    await LoanGuarantor.destroy({ where: { loan_id }, transaction });
    await createGuarantorLinks(loan_id, guarantors, transaction);
}

async function replaceCollaterals(loan_id, collaterals, transaction) {
    await LoanCollateral.destroy({ where: { loan_id }, transaction });
    await createCollaterals(loan_id, collaterals, transaction);
}

function combinedTerms(loan, attributes) {
    return {
        loan_amount:
            attributes.loan_amount !== undefined
                ? attributes.loan_amount
                : loan.loan_amount,
        interest_rate:
            attributes.interest_rate !== undefined
                ? attributes.interest_rate
                : loan.interest_rate,
        interest_payment_mode:
            attributes.interest_payment_mode !== undefined
                ? attributes.interest_payment_mode
                : loan.interest_payment_mode
    };
}

function normalizeFinancialValue(field, value) {
    if (field === "interest_payment_mode") {
        return value;
    }

    return value === null || value === undefined ? null : Number(value);
}

function hasFinancialChanges(loan, attributes) {
    return financialFields.some((field) => {
        if (attributes[field] === undefined) {
            return false;
        }

        return (
            normalizeFinancialValue(field, attributes[field]) !==
            normalizeFinancialValue(field, loan[field])
        );
    });
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
    assertDistinctStakeholders(payload.loan.lender_id, payload.loan.customer_id);

    try {
        const loan_id = await connection.transaction(async (transaction) => {
            const loan = await Loan.create(payload.loan, { transaction });
            await createLoanChildren(loan.loan_id, payload, transaction);
            return loan.loan_id;
        });

        return await getLoanWithRelations(loan_id);
    } catch (error) {
        handleConstraintError(error);
    }
}

export async function replaceLoan(id, data = {}) {
    const loan_id = parseLoanId(id);
    const payload = buildReplaceLoanPayload(data);
    assertDistinctStakeholders(payload.loan.lender_id, payload.loan.customer_id);

    try {
        await connection.transaction(async (transaction) => {
            const loan = await Loan.findByPk(loan_id, { transaction });

            if (!loan) {
                throw new NotFoundError("Loan not found");
            }

            await assertNoPayments(loan_id, transaction);
            await loan.update(payload.loan, { transaction });
            await replaceGuarantors(loan_id, payload.guarantors, transaction);
            await replaceCollaterals(loan_id, payload.collaterals, transaction);
            await replaceInstallments(
                loan_id,
                payload.installments,
                payload.loan.interest_rate,
                transaction
            );
            await ensureInterestPayment(
                loan_id,
                payload.loan.interest_payment_mode,
                transaction
            );
        });

        return await getLoanWithRelations(loan_id);
    } catch (error) {
        handleConstraintError(error);
    }
}

export async function updateLoan(id, data = {}) {
    const loan_id = parseLoanId(id);
    const payload = buildPartialLoanPayload(data);

    try {
        await connection.transaction(async (transaction) => {
            const loan = await Loan.findByPk(loan_id, { transaction });

            if (!loan) {
                throw new NotFoundError("Loan not found");
            }

            const attributes = payload.loan;
            const terms = combinedTerms(loan, attributes);
            const installmentsProvided = payload.installments !== undefined;
            const financialChanges = hasFinancialChanges(loan, attributes);

            assertDistinctStakeholders(
                attributes.lender_id ?? loan.lender_id,
                attributes.customer_id ?? loan.customer_id
            );

            if (financialChanges || installmentsProvided) {
                await assertNoPayments(loan_id, transaction);
            }

            if (financialChanges || attributes.interest_payment_mode !== undefined) {
                assertInterestPaymentMode(
                    terms.interest_payment_mode,
                    terms.interest_rate
                );
            }

            if (financialChanges && !installmentsProvided) {
                throw new ValidationError(
                    "installments is required when loan_amount, interest_rate, or interest_payment_mode changes"
                );
            }

            if (installmentsProvided) {
                assertInstallmentTotals(payload.installments, terms);
            }

            if (Object.keys(attributes).length > 0) {
                await loan.update(attributes, { transaction });
            }

            if (installmentsProvided) {
                await replaceInstallments(
                    loan_id,
                    payload.installments,
                    terms.interest_rate,
                    transaction
                );
            }

            if (payload.guarantors !== undefined) {
                await replaceGuarantors(loan_id, payload.guarantors, transaction);
            }

            if (payload.collaterals !== undefined) {
                await replaceCollaterals(loan_id, payload.collaterals, transaction);
            }

            if (attributes.interest_payment_mode !== undefined) {
                await ensureInterestPayment(
                    loan_id,
                    attributes.interest_payment_mode,
                    transaction
                );
            }
        });

        return await getLoanWithRelations(loan_id);
    } catch (error) {
        handleConstraintError(error);
    }
}

export async function deleteLoan(id) {
    const loan_id = parseLoanId(id);

    try {
        await connection.transaction(async (transaction) => {
            const loan = await Loan.findByPk(loan_id, { transaction });

            if (!loan) {
                throw new NotFoundError("Loan not found");
            }

            await assertNoPayments(loan_id, transaction);
            await LoanInterestPayment.destroy({
                where: { loan_id },
                transaction
            });
            await LoanGuarantor.destroy({ where: { loan_id }, transaction });
            await LoanCollateral.destroy({ where: { loan_id }, transaction });
            await LoanInstallment.destroy({ where: { loan_id }, transaction });
            await loan.destroy({ transaction });
        });
    } catch (error) {
        handleConstraintError(error);
    }
}
