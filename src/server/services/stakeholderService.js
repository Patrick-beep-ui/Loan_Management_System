import Stakeholder from "../models/Stakeholder.js";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors.js";

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

function validateName(value, field) { // could be a helper /user/utils.js
    if (typeof value !== "string" || value.trim() === "") {
        throw new ValidationError(`${field} is required`);
    }

    const trimmed = value.trim();

    if (trimmed.length > NAME_MAX) {
        throw new ValidationError(`${field} must be at most ${NAME_MAX} characters`);
    }

    return trimmed;
}

function validateOptionalString(value, field, maxLength) {
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

    if (trimmed.length > maxLength) {
        throw new ValidationError(`${field} must be at most ${maxLength} characters`);
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
            return validateOptionalString(value, "national_id", NATIONAL_ID_MAX);
        case "marital_status":
            return validateMaritalStatus(value);
        case "occupation":
            return validateOptionalString(value, "occupation", OCCUPATION_MAX);
        case "date_of_birth":
            return validateDateOfBirth(value);
        default:
            throw new ValidationError(`Unknown field: ${field}`);
    }
}

// all validators should not appear in here but in a separate helper util file, and be imported here. This is just a temporary solution for now.

function buildFullAttributes(data) {
    return {
        first_name: validateField("first_name", data.first_name),
        last_name: validateField("last_name", data.last_name),
        national_id: validateField("national_id", data.national_id),
        marital_status: validateField("marital_status", data.marital_status),
        occupation: validateField("occupation", data.occupation),
        date_of_birth: validateField("date_of_birth", data.date_of_birth)
    };
}

function buildPartialAttributes(data) {
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

function parseStakeholderId(id) {
    if (!/^\d+$/.test(String(id))) {
        throw new ValidationError("stakeholder_id must be a positive integer");
    }

    const stakeholder_id = Number(id);

    if (stakeholder_id <= 0) {
        throw new ValidationError("stakeholder_id must be a positive integer");
    }

    return stakeholder_id;
}

// all helper functions should be moved to a separate helper file, and be imported here. This is just a temporary solution for now.

async function findStakeholderOrThrow(stakeholder_id) {
    const stakeholder = await Stakeholder.findByPk(stakeholder_id);

    if (!stakeholder) {
        throw new NotFoundError("Stakeholder not found");
    }

    return stakeholder;
}

function handleConstraintError(error) {
    if (error.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("A stakeholder with that national ID already exists");
    }

    throw error;
}



// only async business logic functions should be here. This is a temporary solution for now. All helper functions should be moved to a separate helper file, and be imported here.

export async function getAllStakeholders() {
    return await Stakeholder.findAll({
        order: [["last_name", "ASC"], ["first_name", "ASC"]]
    });
}

export async function getStakeholderById(id) {
    const stakeholder_id = parseStakeholderId(id);
    return await findStakeholderOrThrow(stakeholder_id);
}

export async function createStakeholder(data = {}) {
    const attributes = buildFullAttributes(data);

    try {
        return await Stakeholder.create(attributes);
    } catch (error) {
        handleConstraintError(error);
    }
}

export async function replaceStakeholder(id, data = {}) {
    const stakeholder_id = parseStakeholderId(id);
    const stakeholder = await findStakeholderOrThrow(stakeholder_id);
    const attributes = buildFullAttributes(data);

    try {
        return await stakeholder.update(attributes);
    } catch (error) {
        handleConstraintError(error);
    }
}

export async function updateStakeholder(id, data = {}) {
    const stakeholder_id = parseStakeholderId(id);
    const stakeholder = await findStakeholderOrThrow(stakeholder_id);
    const attributes = buildPartialAttributes(data);

    try {
        return await stakeholder.update(attributes);
    } catch (error) {
        handleConstraintError(error);
    }
}

export async function deleteStakeholder(id) {
    const stakeholder_id = parseStakeholderId(id);
    const stakeholder = await findStakeholderOrThrow(stakeholder_id);

    try {
        await stakeholder.destroy();
    } catch (error) {
        if (error.name === "SequelizeForeignKeyConstraintError") {
            throw new ConflictError("Stakeholder is referenced and cannot be deleted");
        }

        throw error;
    }
}


// There is a lot of duplicated code in this file. 
// There is no need to have separate functions for each operation, each service function could be refactored to use a single function that takes in the operation type (create, update, delete) and the necessary parameters.