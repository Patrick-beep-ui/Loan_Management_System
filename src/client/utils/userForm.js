import { fullName } from "@/client/utils/loanFormat";

export function buildAdminUserPayload(values) {
    return {
        role_name: values.role_name,
        is_active: Boolean(values.is_active),
    };
}

export function adminUserDisplayName(user) {
    const name = fullName(user?.Stakeholder);

    return name === "—" ? user?.email || "—" : name;
}
