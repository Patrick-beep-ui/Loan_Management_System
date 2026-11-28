import {
    createStakeholder as createStakeholderService,
    deleteStakeholder as deleteStakeholderService,
    getAllStakeholders as getAllStakeholdersService,
    getStakeholderById as getStakeholderByIdService,
    replaceStakeholder as replaceStakeholderService,
    updateStakeholder as updateStakeholderService
} from "../services/stakeholderService.js";

export async function getAllStakeholders(req, res) {
    const stakeholders = await getAllStakeholdersService();
    return res.status(200).json(stakeholders);
}

export async function getStakeholderById(req, res) {
    const stakeholder = await getStakeholderByIdService(req.params.id);
    return res.status(200).json(stakeholder);
}

export async function createStakeholder(req, res) {
    const stakeholder = await createStakeholderService(req.body);
    return res.status(201).json(stakeholder);
}

export async function replaceStakeholder(req, res) {
    const stakeholder = await replaceStakeholderService(req.params.id, req.body);
    return res.status(200).json(stakeholder);
}

export async function updateStakeholder(req, res) {
    const stakeholder = await updateStakeholderService(req.params.id, req.body);
    return res.status(200).json(stakeholder);
}

export async function deleteStakeholder(req, res) {
    await deleteStakeholderService(req.params.id);
    return res.status(204).send();
}
