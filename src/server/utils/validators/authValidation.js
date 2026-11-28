import { ValidationError } from "../errors.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;
const LOGIN_REQUIRED_FIELDS = ["email", "password"];
const CHANGE_PASSWORD_REQUIRED_FIELDS = ["current_password", "new_password"];

function asObject(payload) {
    return payload && typeof payload === "object" ? payload : {};
}

function missingFields(data, fields) {
    return fields.filter((field) => {
        const value = data[field];
        return value === undefined || value === null || value === "";
    });
}

export function validateEmail(value) {
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

export function validatePassword(value, field = "password") {
    if (value === undefined || value === null || value === "") {
        throw new ValidationError(`${field} is required`);
    }

    if (typeof value !== "string") {
        throw new ValidationError(`${field} must be a string`);
    }

    if (value.trim() === "") {
        throw new ValidationError(`${field} is required`);
    }

    return value;
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

export function validateChangePasswordPayload(payload) {
    const data = asObject(payload);
    const missing = missingFields(data, CHANGE_PASSWORD_REQUIRED_FIELDS);

    if (missing.length > 0) {
        throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);
    }

    return {
        current_password: validatePassword(data.current_password, "current_password"),
        new_password: validatePassword(data.new_password, "new_password")
    };
}
