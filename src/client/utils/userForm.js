import { fullName } from "@/client/utils/loanFormat";

export const EMPTY_ADMIN_USER_CREATE_FORM = {
    email: "",
    stakeholder_id: "",
    role_name: "lender",
};

export function buildAdminUserPayload(values) {
    return {
        role_name: values.role_name,
        is_active: Boolean(values.is_active),
    };
}

export function buildAdminUserCreatePayload(values) {
    return {
        email: values.email.trim(),
        stakeholder_id: Number(values.stakeholder_id),
        role_name: values.role_name,
    };
}

export function validateAdminUserCreateForm(values) {
    const errors = {};
    const email = values.email.trim();
    const stakeholderId = Number(values.stakeholder_id);

    if (!email) {
        errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Enter a valid email address.";
    }

    if (!values.stakeholder_id) {
        errors.stakeholder_id = "Select a stakeholder.";
    } else if (!Number.isInteger(stakeholderId) || stakeholderId <= 0) {
        errors.stakeholder_id = "Select a valid stakeholder.";
    }

    if (!["admin", "lender"].includes(values.role_name)) {
        errors.role_name = "Select a role.";
    }

    return errors;
}

export function adminUserDisplayName(user) {
    const name = fullName(user?.Stakeholder);

    return name === "—" ? user?.email || "—" : name;
}
