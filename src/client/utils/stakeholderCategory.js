export const STAKEHOLDER_CATEGORY_FILTERS = [
    { id: "all", label: "All" },
    { id: "admin", label: "Admins" },
    { id: "lender", label: "Lenders" },
    { id: "customer", label: "Customers" },
];

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

export function getStakeholderCategory(roleName) {
    const role = String(roleName || "").toLowerCase();
    return role === "admin" || role === "lender" ? role : "customer";
}

export function categorizeStakeholders(stakeholders = [], users = []) {
    const accountByStakeholderId = new Map();

    for (const user of asArray(users)) {
        if (user.stakeholder_id === null || user.stakeholder_id === undefined) {
            continue;
        }

        const key = String(user.stakeholder_id);
        const roleName = user.Role?.role_name ?? user.role_name;
        const category = getStakeholderCategory(roleName);
        const existing = accountByStakeholderId.get(key);

        if (!existing || (existing.category !== "admin" && category === "admin")) {
            accountByStakeholderId.set(key, { category, roleName });
        }
    }

    return asArray(stakeholders).map((stakeholder) => {
        const account =
            stakeholder.stakeholder_id === null ||
            stakeholder.stakeholder_id === undefined
                ? null
                : accountByStakeholderId.get(String(stakeholder.stakeholder_id)) ||
                  null;

        return {
            ...stakeholder,
            accountRole: account?.roleName || null,
            category: account?.category || "customer",
            hasAccount: Boolean(account),
        };
    });
}

export function countStakeholderCategories(stakeholders = []) {
    const counts = { all: 0, admin: 0, lender: 0, customer: 0 };

    for (const stakeholder of asArray(stakeholders)) {
        counts.all += 1;
        if (Object.prototype.hasOwnProperty.call(counts, stakeholder.category)) {
            counts[stakeholder.category] += 1;
        }
    }

    return counts;
}

export function filterStakeholdersByCategory(stakeholders = [], category = "all") {
    if (category === "all") return asArray(stakeholders);

    return asArray(stakeholders).filter(
        (stakeholder) => stakeholder.category === category,
    );
}
