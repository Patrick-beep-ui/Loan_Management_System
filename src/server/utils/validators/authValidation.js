import { ValidationError } from "../errors.js";
import { parsePositiveInteger } from "./common.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;
const SIGNUP_REQUIRED_FIELDS = ["email", "password", "stakeholder_id"];
const LOGIN_REQUIRED_FIELDS = ["email", "password"];

function asObject(payload) {
    return payload && typeof payload === "object" ? payload : {};
}

function missingFields(data, fields) {
    return fields.filter((field) => {
        const value = data[field];
        return value === undefined || value === null || value === "";
    });
}

function validateEmail(value) {
    if (value === undefined || value === null || value === "") {
        throw new ValidationError("email is required");
    }

    if (typeof value !== "string") {
        throw new ValidationError("email must be a string");
    }

    const trimmed = value.trim();

    if (trimmed === "") {
        throw new ValidationError("email is required");
    }

    if (!EMAIL_PATTERN.test(trimmed)) {
        throw new ValidationError("email must be a valid email address");
    }

    return trimmed.toLowerCase();
}

function validatePassword(value) {
    if (value === undefined || value === null || value === "") {
        throw new ValidationError("password is required");
    }

    if (typeof value !== "string") {
        throw new ValidationError("password must be a string");
    }

    if (value.trim() === "") {
        throw new ValidationError("password is required");
    }

    return value;
}

export function validateSignupPayload(payload) {
    const data = asObject(payload);
    const missing = missingFields(data, SIGNUP_REQUIRED_FIELDS);

    if (missing.length > 0) {
        throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);
    }

    return {
        email: validateEmail(data.email),
        password: validatePassword(data.password),
        stakeholder_id: parsePositiveInteger(data.stakeholder_id, "stakeholder_id")
    };
}

export function validateLoginPayload(payload) {
    const data = asObject(payload);
    const missing = missingFields(data, LOGIN_REQUIRED_FIELDS);

    if (missing.length > 0) {
        throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);
    }

    return {
        email: validateEmail(data.email),
        password: validatePassword(data.password)
    };
}
