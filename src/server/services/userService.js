import User from "../models/User.js";
import Stakeholder from "../models/Stakeholder.js";
import Role from "../models/Role.js";

export async function getAllUsers() {
    return await User.findAll({
        attributes: { exclude: ["password_hash"] },
        include: [
            {
                model: Stakeholder,
                attributes: ["stakeholder_id", "first_name", "last_name"]
            },
            {
                model: Role,
                attributes: ["role_id", "role_name"]
            }
        ]
    });
}
