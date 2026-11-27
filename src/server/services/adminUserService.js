import bcrypt from "bcryptjs";

import Role from "../models/Role.js";
import Stakeholder from "../models/Stakeholder.js";
import User from "../models/User.js";
import { authUser } from "./userService.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { generateTemporaryPassword } from "../utils/temporaryPassword.js";
import {
    buildAdminUserCreatePayload,
    buildAdminUserPatch,
    parseUserId
} from "../utils/validators/adminUserValidation.js";

const BCRYPT_ROUNDS = 10;

function isActive(user) {
    return user.is_active !== false && user.is_active !== 0;
}

async function countActiveAdmins() {
    const adminRole = await Role.findOne({
        where: { role_name: "admin" },
        attributes: ["role_id"]
    });

    if (!adminRole) {
        return 0;
    }

    return User.count({
        where: {
            role_id: adminRole.role_id,
            is_active: true
        }
    });
}

async function projectionWithTemporaryPassword(userId, temporary_password) {
    const projection = await authUser(userId);
    return { ...projection.toJSON(), temporary_password };
}

export async function createAdminUser(payload) {
    const { email, stakeholder_id, role_name } = buildAdminUserCreatePayload(payload);

    const role = await Role.findOne({
        where: { role_name },
        attributes: ["role_id", "role_name"]
    });

    if (!role) {
        throw new ConflictError(`Role ${role_name} does not exist`);
    }

    const stakeholder = await Stakeholder.findByPk(stakeholder_id, {
        attributes: ["stakeholder_id"]
    });

    if (!stakeholder) {
        throw new ConflictError("stakeholder_id does not exist");
    }

    const linkedUser = await User.findOne({
        where: { stakeholder_id },
        attributes: ["user_id"]
    });

    if (linkedUser) {
        throw new ConflictError("A user is already linked to that stakeholder");
    }

    const temporary_password = generateTemporaryPassword();
    const password_hash = await bcrypt.hash(temporary_password, BCRYPT_ROUNDS);

    let user;

    try {
        user = await User.create({
            email,
            password_hash,
            role_id: role.role_id,
            stakeholder_id,
            is_active: true,
            must_change_password: true
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new ConflictError("A user with that email already exists");
        }

        if (error.name === "SequelizeForeignKeyConstraintError") {
            throw new ConflictError("stakeholder_id does not exist");
        }

        throw error;
    }

    return projectionWithTemporaryPassword(user.user_id, temporary_password);
}

export async function resetAdminUserPassword(userId) {
    const parsedUserId = parseUserId(userId);

    const user = await User.findByPk(parsedUserId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    const temporary_password = generateTemporaryPassword();
    const password_hash = await bcrypt.hash(temporary_password, BCRYPT_ROUNDS);

    await user.update({
        password_hash,
        must_change_password: true
    });

    return projectionWithTemporaryPassword(parsedUserId, temporary_password);
}

export async function updateAdminUser(userId, payload) {
    const parsedUserId = parseUserId(userId);
    const attributes = buildAdminUserPatch(payload);

    const user = await User.findByPk(parsedUserId, {
        attributes: { exclude: ["password_hash"] },
        include: [{ model: Role, attributes: ["role_id", "role_name"] }]
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

    const currentRoleName = user.Role?.role_name ?? null;
    const finalRoleName = attributes.role_name ?? currentRoleName;
    const currentActive = isActive(user);
    const finalActive = attributes.is_active === undefined
        ? currentActive
        : attributes.is_active;

    if (currentRoleName === "admin" && currentActive &&
        (finalRoleName !== "admin" || !finalActive)) {
        if (await countActiveAdmins() <= 1) {
            throw new ConflictError("Cannot demote or deactivate the last active admin");
        }
    }

    await user.update(changes);

    return authUser(parsedUserId);
}
