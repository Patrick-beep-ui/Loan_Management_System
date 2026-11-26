import Role from "../models/Role.js";
import User from "../models/User.js";
import { authUser } from "./userService.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { buildAdminUserPatch, parseUserId } from "../utils/validators/adminUserValidation.js";

export async function updateAdminUser(userId, payload) {
    const parsedUserId = parseUserId(userId);
    const attributes = buildAdminUserPatch(payload);

    const user = await User.findByPk(parsedUserId, {
        attributes: { exclude: ["password_hash"] }
    });

    if (!user) {
        throw new NotFoundError("User not found");
    }

    const changes = {};

    if (attributes.role_name !== undefined) {
        const role = await Role.findOne({
            where: { role_name: attributes.role_name },
            attributes: ["role_id", "role_name"]
        });

        if (!role) {
            throw new ConflictError(`Role ${attributes.role_name} does not exist`);
        }

        changes.role_id = role.role_id;
    }

    if (attributes.is_active !== undefined) {
        changes.is_active = attributes.is_active;
    }

    await user.update(changes);

    return authUser(parsedUserId);
}
