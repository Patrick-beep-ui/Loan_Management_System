import { ValidationError } from "../errors.js";

export function parsePositiveInteger(value, field) {
    const normalized = typeof value === "string" ? value.trim() : value;

    if (normalized === undefined || normalized === null || normalized === "") {
        throw new ValidationError(`${field} is required`);
    }

    if (typeof normalized !== "number" && typeof normalized !== "string") {
        throw new ValidationError(`${field} must be a positive integer`);
    }

    if (!/^\d+$/.test(String(normalized))) {
        throw new ValidationError(`${field} must be a positive integer`);
    }

    const parsed = Number(normalized);

    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw new ValidationError(`${field} must be a positive integer`);
    }

    return parsed;
}

export function parseOptionalString(value, field, maxLength) {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value !== "string") {
        throw new ValidationError(`${field} must be a string`);
    }

    const trimmed = value.trim();

    if (trimmed === "") {
        return null;
    }

    if (maxLength !== undefined && trimmed.length > maxLength) {
        throw new ValidationError(`${field} must be at most ${maxLength} characters`);
    }

    return trimmed;
}

export function parseFiniteNumber(value, field, { min, max, optional = false } = {}) {
    if (value === undefined || value === null) {
        if (optional) {
            return null;
        }

        throw new ValidationError(`${field} is required`);
    }

    if (typeof value !== "number" && typeof value !== "string") {
        throw new ValidationError(`${field} must be a number`);
    }

    if (typeof value === "string" && value.trim() === "") {
        if (optional) {
            return null;
        }

        throw new ValidationError(`${field} is required`);
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        throw new ValidationError(`${field} must be a number`);
    }

    if (min !== undefined && parsed < min) {
        throw new ValidationError(`${field} must be at least ${min}`);
    }

    if (max !== undefined && parsed > max) {
        throw new ValidationError(`${field} must be at most ${max}`);
    }

    return parsed;
}
