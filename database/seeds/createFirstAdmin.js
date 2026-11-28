import bcrypt from "bcryptjs";

import connection from "../../src/server/config/connection.js";
import Role from "../../src/server/models/Role.js";
import Stakeholder from "../../src/server/models/Stakeholder.js";
import User from "../../src/server/models/User.js";

async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const stakeholderId = Number(process.env.ADMIN_STAKEHOLDER_ID);

    if (!email || !password || !Number.isInteger(stakeholderId) || stakeholderId <= 0) {
        throw new Error(
            "ADMIN_EMAIL, ADMIN_PASSWORD and a positive integer ADMIN_STAKEHOLDER_ID are required",
        );
    }

    await connection.authenticate();

    const adminRole = await Role.findOne({
        where: { role_name: "admin" },
        attributes: ["role_id"],
    });

    if (!adminRole) {
        throw new Error('The "admin" role is not configured. Apply the roles migration first.');
    }

    const existingAdmins = await User.count({
        where: { role_id: adminRole.role_id },
    });

    if (existingAdmins > 0) {
        throw new Error("An admin account already exists; this seed script runs only once.");
    }

    const stakeholder = await Stakeholder.findByPk(stakeholderId, {
        attributes: ["stakeholder_id"],
    });

    if (!stakeholder) {
        throw new Error(`Stakeholder ${stakeholderId} does not exist`);
    }

    const linkedUser = await User.findOne({
        where: { stakeholder_id: stakeholder.stakeholder_id },
        attributes: ["user_id"],
    });

    if (linkedUser) {
        throw new Error(`Stakeholder ${stakeholderId} is already linked to a user`);
    }

    await User.create({
        email: email.trim().toLowerCase(),
        password_hash: await bcrypt.hash(password, 10),
        role_id: adminRole.role_id,
        stakeholder_id: stakeholder.stakeholder_id,
        is_active: true,
        must_change_password: true,
    });

    console.log(
        `Created admin account for ${email.trim().toLowerCase()}. ` +
            "Sign in and change the password when prompted.",
    );
}

main()
    .catch((error) => {
        console.error(`Seed failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await connection.close();
    });
