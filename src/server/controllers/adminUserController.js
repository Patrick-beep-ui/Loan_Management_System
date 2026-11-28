import {
    createAdminUser as createAdminUserService,
    resetAdminUserPassword as resetAdminUserPasswordService,
    updateAdminUser as updateAdminUserService
} from "../services/adminUserService.js";

export async function createAdminUser(req, res) {
    const user = await createAdminUserService(req.body);
    return res.status(201).json(user);
}

export async function resetAdminUserPassword(req, res) {
    const user = await resetAdminUserPasswordService(req.params.userId);
    return res.status(200).json(user);
}

export async function updateAdminUser(req, res) {
    const user = await updateAdminUserService(req.params.userId, req.body);
    return res.status(200).json(user);
}
