import Stakeholder from "../models/Stakeholder.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import {
    buildFullStakeholderAttributes,
    buildPartialStakeholderAttributes,
    parseStakeholderId
} from "../utils/validators/stakeholderValidation.js";

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
    const attributes = buildFullStakeholderAttributes(data);

    try {
        return await Stakeholder.create(attributes);
    } catch (error) {
        handleConstraintError(error);
    }
}

export async function replaceStakeholder(id, data = {}) {
    const stakeholder_id = parseStakeholderId(id);
    const stakeholder = await findStakeholderOrThrow(stakeholder_id);
    const attributes = buildFullStakeholderAttributes(data);

    try {
        return await stakeholder.update(attributes);
    } catch (error) {
        handleConstraintError(error);
    }
}

export async function updateStakeholder(id, data = {}) {
    const stakeholder_id = parseStakeholderId(id);
    const stakeholder = await findStakeholderOrThrow(stakeholder_id);
    const attributes = buildPartialStakeholderAttributes(data);

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