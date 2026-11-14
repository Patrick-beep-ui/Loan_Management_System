import Role from "../models/Role.js";

export async function getAllRoles() {
    return await Role.findAll();
}
