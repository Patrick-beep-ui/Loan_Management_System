import { ValidationError } from "../errors.js";
import { parseFiniteNumber, parsePositiveInteger } from "./common.js";

const MONEY_MAX = 9999999999.99;
const DATETIME_PATTERN =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

function asObject(payload) {
    return payload && typeof payload === "object" ? payload : {};
}

function isProvided(value) {
    return value !== undefined && value !== null && value !== "";
}

function parseAmount(value) {
    const amount = parseFiniteNumber(value, "amount", { min: 0.01, max: MONEY_MAX });

    if (Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-6) {
        throw new ValidationError("amount must have at most 2 decimal places");
    }

    return Math.round(amount * 100) / 100;
}

function parsePaidAt(value) {
    if (!isProvided(value)) {
        return new Date().toISOString();
    }

    if (typeof value !== "string" || !DATETIME_PATTERN.test(value.trim())) {
        throw new ValidationError("paid_at must be a valid ISO datetime with a timezone");
    }

    const date = new Date(value.trim());

    if (Number.isNaN(date.getTime())) {
        throw new ValidationError("paid_at must be a valid ISO datetime with a timezone");
    }

    return date.toISOString();
}

function parseBasePayment(data) {
    return {
        loan_id: parsePositiveInteger(data.loan_id, "loan_id"),
        amount: parseAmount(data.amount),
        paid_at: parsePaidAt(data.paid_at)
    };
}

export function parsePaymentId(value) {
    return parsePositiveInteger(value, "payment_id");
}

export function buildCreateInstallmentPaymentPayload(payload = {}) {
    const data = asObject(payload);

    return {
        ...parseBasePayment(data),
        installment_id: parsePositiveInteger(data.installment_id, "installment_id")
    };
}

export function buildCreateInterestPaymentPayload(payload = {}) {
    const data = asObject(payload);

    return {
        ...parseBasePayment(data),
        loan_interest_payment_id: parsePositiveInteger(
            data.loan_interest_payment_id,
            "loan_interest_payment_id"
        )
    };
}

export function buildUpdatePaymentPayload(payload = {}) {
    const data = asObject(payload);

    if (!isProvided(data.paid_at)) {
        throw new ValidationError("paid_at is required");
    }

    return { paid_at: parsePaidAt(data.paid_at) };
}
