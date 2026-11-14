import { getAllRoles as getAllRolesService } from "../services/roleService.js";

export async function getAllRoles(req, res) {
    try {
        const roles = await getAllRolesService();
        return res.status(200).json(roles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
