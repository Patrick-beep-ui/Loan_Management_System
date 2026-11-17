import { ValidationError } from "../errors.js";
import { parseOptionalString, parsePositiveInteger } from "./common.js";

const NAME_MAX = 100;
const NATIONAL_ID_MAX = 50;
const OCCUPATION_MAX = 100;
const MARITAL_STATUSES = ["single", "married"];
const UPDATABLE_FIELDS = [
    "first_name",
    "last_name",
    "national_id",
    "marital_status",
    "occupation",
    "date_of_birth"
];

function asObject(payload) {
    return payload && typeof payload === "object" ? payload : {};
}

function validateName(value, field) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new ValidationError(`${field} is required`);
    }

    const trimmed = value.trim();

    if (trimmed.length > NAME_MAX) {
        throw new ValidationError(`${field} must be at most ${NAME_MAX} characters`);
    }

    return trimmed;
}

function validateMaritalStatus(value) {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    if (!MARITAL_STATUSES.includes(value)) {
        throw new ValidationError(`marital_status must be one of: ${MARITAL_STATUSES.join(", ")}`);
    }

    return value;
}

function validateDateOfBirth(value) {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new ValidationError("date_of_birth must be in YYYY-MM-DD format");
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new ValidationError("date_of_birth must be a valid date");
    }

    return value;
}

function validateField(field, value) {
    switch (field) {
        case "first_name":
        case "last_name":
            return validateName(value, field);
        case "national_id":
            return parseOptionalString(value, "national_id", NATIONAL_ID_MAX);
        case "marital_status":
            return validateMaritalStatus(value);
        case "occupation":
            return parseOptionalString(value, "occupation", OCCUPATION_MAX);
        case "date_of_birth":
            return validateDateOfBirth(value);
        default:
            throw new ValidationError(`Unknown field: ${field}`);
    }
}

export function parseStakeholderId(id) {
    return parsePositiveInteger(id, "stakeholder_id");
}

export function buildFullStakeholderAttributes(payload) {
    const data = asObject(payload);

    return {
        first_name: validateField("first_name", data.first_name),
        last_name: validateField("last_name", data.last_name),
        national_id: validateField("national_id", data.national_id),
        marital_status: validateField("marital_status", data.marital_status),
        occupation: validateField("occupation", data.occupation),
        date_of_birth: validateField("date_of_birth", data.date_of_birth)
    };
}

export function buildPartialStakeholderAttributes(payload) {
    const data = asObject(payload);
    const attributes = {};

    for (const field of UPDATABLE_FIELDS) {
        if (data[field] !== undefined) {
            attributes[field] = validateField(field, data[field]);
        }
    }

    if (Object.keys(attributes).length === 0) {
        throw new ValidationError("No fields to update");
    }

    return attributes;
}
