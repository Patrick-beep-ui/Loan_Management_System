import { getAllRoles as getAllRolesService } from "../services/roleService.js";

export async function getAllRoles(req, res) {
    const roles = await getAllRolesService();
    return res.status(200).json(roles);
}
