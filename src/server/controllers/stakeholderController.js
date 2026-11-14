import {
    createStakeholder as createStakeholderService,
    deleteStakeholder as deleteStakeholderService,
    getAllStakeholders as getAllStakeholdersService,
    getStakeholderById as getStakeholderByIdService,
    replaceStakeholder as replaceStakeholderService,
    updateStakeholder as updateStakeholderService
} from "../services/stakeholderService.js";
import { AppError } from "../utils/errors.js";

function handleError(res, error, context) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(`Error ${context}:`, error);
    return res.status(500).json({ error: "Internal Server Error" });
}

// handle error is a helper function, it should not be here in controller, it should be in a separate helper file and imported here. This is just a temporary solution for now.

export async function getAllStakeholders(req, res) {
    try {
        const stakeholders = await getAllStakeholdersService();
        return res.status(200).json(stakeholders);
    } catch (error) {
        return handleError(res, error, "fetching stakeholders");
    }
}

export async function getStakeholderById(req, res) {
    try {
        const stakeholder = await getStakeholderByIdService(req.params.id);
        return res.status(200).json(stakeholder);
    } catch (error) {
        return handleError(res, error, "fetching stakeholder");
    }
}

export async function createStakeholder(req, res) {
    try {
        const stakeholder = await createStakeholderService(req.body);
        return res.status(201).json(stakeholder);
    } catch (error) {
        return handleError(res, error, "creating stakeholder");
    }
}

export async function replaceStakeholder(req, res) {
    try {
        const stakeholder = await replaceStakeholderService(req.params.id, req.body);
        return res.status(200).json(stakeholder);
    } catch (error) {
        return handleError(res, error, "replacing stakeholder");
    }
}

export async function updateStakeholder(req, res) {
    try {
        const stakeholder = await updateStakeholderService(req.params.id, req.body);
        return res.status(200).json(stakeholder);
    } catch (error) {
        return handleError(res, error, "updating stakeholder");
    }
}

export async function deleteStakeholder(req, res) {
    try {
        await deleteStakeholderService(req.params.id);
        return res.status(204).send();
    } catch (error) {
        return handleError(res, error, "deleting stakeholder");
    }
}
