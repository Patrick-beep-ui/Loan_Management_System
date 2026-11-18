import { ValidationError } from "../errors.js";
import { buildFullStakeholderAttributes } from "./stakeholderValidation.js";
import { parseFiniteNumber, parsePositiveInteger } from "./common.js";

const MONEY_MAX = 9999999999.99;
const INTEREST_RATE_MAX = 999.9999;
const DESCRIPTION_MAX = 65535;
const INTEREST_PAYMENT_MODES = ["included", "separate"];
const INLINE_STAKEHOLDER_FIELDS = [
    "first_name",
    "last_name",
    "national_id",
    "marital_status",
    "occupation",
    "date_of_birth"
];
const UPDATABLE_FIELDS = [
    "lender_id",
    "customer_id",
    "loan_amount",
    "interest_rate",
    "interest_payment_mode",
    "disbursed_at"
];
const FINANCIAL_FIELDS = [
    "loan_amount",
    "interest_rate",
    "interest_payment_mode"
];
const DATETIME_PATTERN =
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:?\d{2})?$/;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function asObject(payload) {
    return payload && typeof payload === "object" ? payload : {};
}

function asItemObject(value, field) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new ValidationError(`${field} items must be objects`);
    }

    return value;
}

function requireArray(value, field) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new ValidationError(`${field} must contain at least one item`);
    }

    return value;
}

function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function parseOffset(zone) {
    if (!zone || zone === "Z") {
        return 0;
    }

    const sign = zone.startsWith("-") ? -1 : 1;
    const digits = zone.slice(1).replace(":", "");
    const hours = Number(digits.slice(0, 2));
    const minutes = Number(digits.slice(2, 4));

    if (hours > 23 || minutes > 59) {
        throw new ValidationError("disbursed_at must be a valid datetime");
    }

    return sign * (hours * 60 + minutes);
}

function validateDisbursedAt(value) {
    if (value === undefined || value === null || value === "") {
        throw new ValidationError("disbursed_at is required");
    }

    if (typeof value !== "string") {
        throw new ValidationError("disbursed_at must be a valid datetime");
    }

    const match = DATETIME_PATTERN.exec(value.trim());

    if (!match) {
        throw new ValidationError("disbursed_at must be a valid datetime");
    }

    const [
        ,
        yearStr,
        monthStr,
        dayStr,
        hourStr,
        minuteStr,
        secondStr = "0",
        msStr = "0",
        zone
    ] = match;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    const second = Number(secondStr);
    const millisecond = Number(msStr.padEnd(3, "0"));

    if (
        year < 1000 ||
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > daysInMonth(year, month) ||
        hour > 23 ||
        minute > 59 ||
        second > 59
    ) {
        throw new ValidationError("disbursed_at must be a valid datetime");
    }

    const offsetMinutes = parseOffset(zone);
    const date = zone
        ? new Date(
              Date.UTC(year, month - 1, day, hour, minute, second, millisecond) -
                  offsetMinutes * 60000
          )
        : new Date(year, month - 1, day, hour, minute, second, millisecond);

    if (Number.isNaN(date.getTime())) {
        throw new ValidationError("disbursed_at must be a valid datetime");
    }

    if (
        !zone &&
        (date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day ||
            date.getHours() !== hour ||
            date.getMinutes() !== minute ||
            date.getSeconds() !== second)
    ) {
        throw new ValidationError("disbursed_at must be a valid datetime");
    }

    return date.toISOString();
}

function validateDateOnly(value, field) {
    if (typeof value !== "string") {
        throw new ValidationError(`${field} must be in YYYY-MM-DD format`);
    }

    const normalized = value.trim();
    const match = DATE_ONLY_PATTERN.exec(normalized);

    if (!match) {
        throw new ValidationError(`${field} must be in YYYY-MM-DD format`);
    }

    const [, yearStr, monthStr, dayStr] = match;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new ValidationError(`${field} must be a valid date`);
    }

    return normalized;
}

function parseMoney(value, field, { optional = false, positive = true } = {}) {
    const amount = parseFiniteNumber(value, field, {
        min: 0,
        max: MONEY_MAX,
        optional
    });

    if (amount === null) {
        return null;
    }

    if (positive && amount <= 0) {
        throw new ValidationError(`${field} must be a positive number`);
    }

    const cents = amount * 100;
    const rounded = Math.round(cents);

    if (Math.abs(cents - rounded) > 1e-6) {
        throw new ValidationError(`${field} must have at most 2 decimal places`);
    }

    return rounded / 100;
}

function validateLoanAmount(value) {
    return parseMoney(value, "loan_amount");
}

function validateInterestRate(value) {
    return parseFiniteNumber(value, "interest_rate", {
        min: 0,
        max: INTEREST_RATE_MAX,
        optional: true
    });
}

function validateInterestPaymentMode(value) {
    const normalized = typeof value === "string" ? value.trim() : value;

    if (!INTEREST_PAYMENT_MODES.includes(normalized)) {
        throw new ValidationError(
            `interest_payment_mode must be one of: ${INTEREST_PAYMENT_MODES.join(", ")}`
        );
    }

    return normalized;
}

function validateRequiredString(value, field, maxLength) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new ValidationError(`${field} is required`);
    }

    const normalized = value.trim();

    if (normalized.length > maxLength) {
        throw new ValidationError(`${field} must be at most ${maxLength} characters`);
    }

    return normalized;
}

function toCents(value) {
    return Math.round(Number(value) * 100);
}

function expectedTotalCents({ loan_amount, interest_rate, interest_payment_mode }) {
    const loanCents = toCents(loan_amount);
    const interestCents = Math.round((loanCents * Number(interest_rate ?? 0)) / 100);

    return interest_payment_mode === "included"
        ? loanCents + interestCents
        : loanCents;
}

function parseInstallments(value) {
    const rows = requireArray(value, "installments").map((item, index) =>
        asItemObject(item, "installments")
    );
    const numbers = new Set();
    const dates = new Set();
    const installments = rows.map((item, index) => {
        const installment_number = parsePositiveInteger(
            item.installment_number,
            `installments[${index}].installment_number`
        );

        if (numbers.has(installment_number)) {
            throw new ValidationError("installment_number values must be unique");
        }

        numbers.add(installment_number);

        return {
            installment_number,
            amount_due: parseMoney(item.amount_due, `installments[${index}].amount_due`),
            due_date: validateDateOnly(item.due_date, `installments[${index}].due_date`)
        };
    });

    installments.sort((a, b) => a.installment_number - b.installment_number);

    for (let index = 0; index < installments.length; index += 1) {
        const installment = installments[index];

        if (installment.installment_number !== index + 1) {
            throw new ValidationError(
                "installment_number values must be consecutive starting at 1"
            );
        }

        if (dates.has(installment.due_date)) {
            throw new ValidationError("due_date values must be unique");
        }

        dates.add(installment.due_date);

        if (index > 0 && installment.due_date <= installments[index - 1].due_date) {
            throw new ValidationError(
                "due_date values must be in ascending order by installment_number"
            );
        }
    }

    if (installments.length > 1) {
        const firstCents = toCents(installments[0].amount_due);

        for (let index = 1; index < installments.length - 1; index += 1) {
            if (toCents(installments[index].amount_due) !== firstCents) {
                throw new ValidationError(
                    "installment amounts must be equal except for the last installment"
                );
            }
        }
    }

    return installments;
}

function parseGuarantors(value) {
    const rows = requireArray(value, "guarantors").map((item) =>
        asItemObject(item, "guarantors")
    );
    const stakeholderIds = new Set();

    return rows.map((item, index) => {
        const hasStakeholderId = item.stakeholder_id !== undefined;
        const hasInlineFields = INLINE_STAKEHOLDER_FIELDS.some(
            (field) => item[field] !== undefined
        );

        if (hasStakeholderId && hasInlineFields) {
            throw new ValidationError(
                `guarantors[${index}] must contain either stakeholder_id or stakeholder fields, not both`
            );
        }

        if (hasStakeholderId) {
            const stakeholder_id = parsePositiveInteger(
                item.stakeholder_id,
                `guarantors[${index}].stakeholder_id`
            );

            if (stakeholderIds.has(stakeholder_id)) {
                throw new ValidationError("guarantors must not contain duplicate stakeholders");
            }

            stakeholderIds.add(stakeholder_id);

            return { stakeholder_id };
        }

        return { stakeholder: buildFullStakeholderAttributes(item) };
    });
}

function parseCollaterals(value) {
    const rows = requireArray(value, "collaterals").map((item) =>
        asItemObject(item, "collaterals")
    );

    return rows.map((item, index) => ({
        description: validateRequiredString(
            item.description,
            `collaterals[${index}].description`,
            DESCRIPTION_MAX
        ),
        estimated_value: parseMoney(
            item.estimated_value,
            `collaterals[${index}].estimated_value`,
            { optional: true, positive: false }
        )
    }));
}

function validateField(field, value) {
    switch (field) {
        case "lender_id":
            return parsePositiveInteger(value, "lender_id");
        case "customer_id":
            return parsePositiveInteger(value, "customer_id");
        case "loan_amount":
            return validateLoanAmount(value);
        case "interest_rate":
            return validateInterestRate(value);
        case "interest_payment_mode":
            return validateInterestPaymentMode(value);
        case "disbursed_at":
            return validateDisbursedAt(value);
        default:
            throw new ValidationError(`Unknown field: ${field}`);
    }
}

export function parseLoanId(id) {
    return parsePositiveInteger(id, "loan_id");
}

function normalizeFinancialValue(field, value) {
    if (field === "interest_payment_mode") {
        return value;
    }

    return value === null || value === undefined ? null : Number(value);
}

function combinedTerms(loan, attributes) {
    return {
        lender_id:
            attributes.lender_id !== undefined
                ? attributes.lender_id
                : loan.lender_id,
        customer_id:
            attributes.customer_id !== undefined
                ? attributes.customer_id
                : loan.customer_id,
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

function hasFinancialChanges(loan, attributes) {
    return FINANCIAL_FIELDS.some((field) => {
        if (attributes[field] === undefined) {
            return false;
        }

        return (
            normalizeFinancialValue(field, attributes[field]) !==
            normalizeFinancialValue(field, loan[field])
        );
    });
}

function assertDistinctStakeholders(lender_id, customer_id) {
    if (lender_id === customer_id) {
        throw new ValidationError("lender_id and customer_id must be different");
    }
}

function assertInterestPaymentMode(interest_payment_mode, interest_rate) {
    if (
        interest_payment_mode === "separate" &&
        !(Number(interest_rate) > 0)
    ) {
        throw new ValidationError(
            "interest_rate must be greater than 0 when interest_payment_mode is separate"
        );
    }
}

function assertInstallmentTotals(installments, terms) {
    const totalCents = installments.reduce(
        (total, installment) => total + toCents(installment.amount_due),
        0
    );
    const expectedCents = expectedTotalCents(terms);

    if (totalCents !== expectedCents) {
        throw new ValidationError(
            `installments total must equal ${(expectedCents / 100).toFixed(2)}`
        );
    }
}

function buildFullLoanAttributes(payload) {
    const data = asObject(payload);

    return {
        lender_id: validateField("lender_id", data.lender_id),
        customer_id: validateField("customer_id", data.customer_id),
        loan_amount: validateField("loan_amount", data.loan_amount),
        interest_rate: validateField("interest_rate", data.interest_rate),
        interest_payment_mode: validateField(
            "interest_payment_mode",
            data.interest_payment_mode
        ),
        disbursed_at: validateField("disbursed_at", data.disbursed_at)
    };
}

function buildPartialLoanAttributes(payload) {
    const data = asObject(payload);
    const attributes = {};

    for (const field of UPDATABLE_FIELDS) {
        if (data[field] !== undefined) {
            attributes[field] = validateField(field, data[field]);
        }
    }

    return attributes;
}

export function buildCreateLoanPayload(payload) {
    const data = asObject(payload);
    const loan = buildFullLoanAttributes(data);
    const installments = parseInstallments(data.installments);

    assertDistinctStakeholders(loan.lender_id, loan.customer_id);
    assertInterestPaymentMode(loan.interest_payment_mode, loan.interest_rate);
    assertInstallmentTotals(installments, loan);

    return {
        loan,
        terms: loan,
        installments,
        guarantors: parseGuarantors(data.guarantors),
        collaterals: parseCollaterals(data.collaterals)
    };
}

export function buildReplaceLoanPayload(payload) {
    return buildCreateLoanPayload(payload);
}

export function buildPartialLoanPayload(payload, currentLoan) {
    const data = asObject(payload);
    const loan = buildPartialLoanAttributes(data);
    const result = { loan };
    let hasRelations = false;

    if (data.installments !== undefined) {
        result.installments = parseInstallments(data.installments);
        hasRelations = true;
    }

    if (data.guarantors !== undefined) {
        result.guarantors = parseGuarantors(data.guarantors);
        hasRelations = true;
    }

    if (data.collaterals !== undefined) {
        result.collaterals = parseCollaterals(data.collaterals);
        hasRelations = true;
    }

    if (Object.keys(loan).length === 0 && !hasRelations) {
        throw new ValidationError("No fields to update");
    }

    const terms = combinedTerms(currentLoan, loan);
    const financialChanges = hasFinancialChanges(currentLoan, loan);
    const installmentsProvided = result.installments !== undefined;

    assertDistinctStakeholders(terms.lender_id, terms.customer_id);

    if (financialChanges || loan.interest_payment_mode !== undefined) {
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
        assertInstallmentTotals(result.installments, terms);
    }

    result.terms = terms;
    result.financialChanges = financialChanges;

    return result;
}
