import bcrypt from "bcryptjs";

import Role from "../models/Role.js";
import User from "../models/User.js";
import { UnauthorizedError, ValidationError } from "../utils/errors.js";
import {
    validateChangePasswordPayload,
    validateLoginPayload
} from "../utils/validators/authValidation.js";

export async function changePassword(userId, payload = {}) {
    const { current_password, new_password } = validateChangePasswordPayload(payload);

    const user = await User.findByPk(userId);

    if (!user) {
        throw new UnauthorizedError("Invalid or expired token");
    }

    const isMatch = await bcrypt.compare(current_password, user.password_hash);

    if (!isMatch) {
        throw new UnauthorizedError("Current password is incorrect");
    }

    if (current_password === new_password) {
        throw new ValidationError("New password must be different from the current password");
    }

    const password_hash = await bcrypt.hash(new_password, 10);

    await user.update({
        password_hash,
        must_change_password: false
    });

    return { message: "Password changed successfully" };
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

    if (user.is_active === false || user.is_active === 0) {
        throw new UnauthorizedError("Account is inactive");
    }

    return {
        user_id: user.user_id,
        stakeholder_id: user.stakeholder_id,
        email: user.email,
        role_id: user.role_id,
        role_name: user.Role?.role_name ?? null,
        must_change_password: Boolean(user.must_change_password)
    };
}
