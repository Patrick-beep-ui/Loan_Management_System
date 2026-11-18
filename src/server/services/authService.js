import bcrypt from "bcryptjs";

import Role from "../models/Role.js";
import User from "../models/User.js";
import { AppError, ConflictError, UnauthorizedError } from "../utils/errors.js";
import {
    validateLoginPayload,
    validateSignupPayload
} from "../utils/validators/authValidation.js";

export async function signup(payload = {}) {
    const { email, password, stakeholder_id } = validateSignupPayload(payload);

    const lenderRole = await Role.findOne({
        where: { role_name: "lender" },
        attributes: ["role_id"]
    });

    if (!lenderRole) {
        throw new AppError("The lender role is not configured", 500);
    }

    const password_hash = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({
            email,
            password_hash,
            role_id: lenderRole.role_id,
            stakeholder_id
        });

        return {
            user_id: user.user_id,
            stakeholder_id: user.stakeholder_id,
            email: user.email,
            role_id: user.role_id,
            role_name: "lender"
        };
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new ConflictError("A user with that email already exists");
        }

        if (error.name === "SequelizeForeignKeyConstraintError") {
            throw new ConflictError("stakeholder_id does not exist");
        }

        throw error;
    }
}

export async function login(payload = {}) {
    const { email, password } = validateLoginPayload(payload);

    const user = await User.findOne({
        where: { email },
        include: [{ model: Role, attributes: ["role_name"] }]
    });

    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        throw new UnauthorizedError("Invalid email or password");
    }

    return {
        user_id: user.user_id,
        stakeholder_id: user.stakeholder_id,
        email: user.email,
        role_id: user.role_id,
        role_name: user.Role?.role_name ?? null
    };
}