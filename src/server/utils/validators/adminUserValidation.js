import { ValidationError } from "../errors.js";
import { validateEmail } from "./authValidation.js";
import { parsePositiveInteger } from "./common.js";

const ROLE_NAMES = ["admin", "lender"];

function asObject(payload) {
    return payload && typeof payload === "object" ? payload : {};
}

export function parseUserId(userId) {
    return parsePositiveInteger(userId, "user_id");
}

export function buildAdminUserPatch(payload) {
    const data = asObject(payload);
    const attributes = {};

    if (data.role_name !== undefined) {
        if (typeof data.role_name !== "string" || !ROLE_NAMES.includes(data.role_name)) {
            throw new ValidationError(`role_name must be one of: ${ROLE_NAMES.join(", ")}`);
        }

        attributes.role_name = data.role_name;
    }

    if (data.is_active !== undefined) {
        if (typeof data.is_active !== "boolean") {
            throw new ValidationError("is_active must be a boolean");
        }

        attributes.is_active = data.is_active;
    }

    if (Object.keys(attributes).length === 0) {
        throw new ValidationError("At least one field is required");
    }

    return attributes;
}

export function buildAdminUserCreatePayload(payload) {
    const data = asObject(payload);

    if (typeof data.role_name !== "string" || !ROLE_NAMES.includes(data.role_name)) {
        throw new ValidationError(`role_name must be one of: ${ROLE_NAMES.join(", ")}`);
    }

    return {
        email: validateEmail(data.email),
        stakeholder_id: parsePositiveInteger(data.stakeholder_id, "stakeholder_id"),
        role_name: data.role_name
    };
}
