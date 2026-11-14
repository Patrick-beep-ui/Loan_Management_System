import bcrypt from "bcryptjs";

import User from "../models/User.js";
import { ConflictError, UnauthorizedError, ValidationError } from "../utils/errors.js";

const REQUIRED_FIELDS = ["email", "password", "role_id", "stakeholder_id"];

export async function signup({ email, password, role_id, stakeholder_id } = {}) {
    const fields = { email, password, role_id, stakeholder_id };
    const missing = REQUIRED_FIELDS.filter((field) => {
        const value = fields[field];
        return value === undefined || value === null || value === "";
    });

    if (missing.length > 0) {
        throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);
    }

    const password_hash = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({
            email: email.trim().toLowerCase(),
            password_hash,
            role_id,
            stakeholder_id
        });

        return {
            user_id: user.user_id,
            stakeholder_id: user.stakeholder_id,
            email: user.email,
            role_id: user.role_id
        };
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new ConflictError("A user with that email already exists");
        }
        throw error;
    }
}

export async function login({ email, password } = {}) {
    if (!email || !password) {
        throw new ValidationError("Missing required fields: email, password");
    }

    const user = await User.findOne({
        where: { email: email.trim().toLowerCase() }
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
        role_id: user.role_id
    };
}
