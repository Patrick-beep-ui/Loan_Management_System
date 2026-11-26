import { useEffect, useState } from "react";

import api from "@/lib/axiosService";
import { adminUserDisplayName } from "@/client/utils/userForm";

export function useAdminLoans() {
    const [loans, setLoans] = useState([]);
    const [lenderUsers, setLenderUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingLenders, setLoadingLenders] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [reassignTarget, setReassignTarget] = useState(null);
    const [selectedLenderId, setSelectedLenderId] = useState("");

    async function fetchLoans() {
        setLoading(true);

        try {
            const { data } = await api.get("/loans");
            setLoans(Array.isArray(data) ? data : []);
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "Unable to load loans. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function fetchLenderUsers() {
        setLoadingLenders(true);

        try {
            const { data } = await api.get("/users");
            const users = Array.isArray(data) ? data : [];
            const optionsById = new Map();

            for (const user of users) {
                if (user.Role?.role_name !== "lender" || !user.stakeholder_id) {
                    continue;
                }

                if (optionsById.has(user.stakeholder_id)) continue;

                const displayName = adminUserDisplayName(user);
                const label = user.email
                    ? displayName === user.email
                        ? user.email
                        : `${displayName} (${user.email})`
                    : displayName;

                optionsById.set(user.stakeholder_id, {
                    stakeholder_id: user.stakeholder_id,
                    label,
                });
            }

            setLenderUsers(
                [...optionsById.values()].sort((a, b) =>
                    a.label.localeCompare(b.label),
                ),
            );
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "Unable to load lender accounts. Please try again.",
            );
        } finally {
            setLoadingLenders(false);
        }
    }

    async function refresh() {
        setError("");
        setSuccess("");
        await Promise.all([fetchLoans(), fetchLenderUsers()]);
    }

    useEffect(() => {
        refresh();
    }, []);

    function openReassign(loan) {
        setError("");
        setSuccess("");
        setReassignTarget(loan);

        const hasCurrentLender = lenderUsers.some(
            (option) => String(option.stakeholder_id) === String(loan.lender_id),
        );

        setSelectedLenderId(hasCurrentLender ? String(loan.lender_id) : "");
    }

    function closeReassign() {
        setReassignTarget(null);
        setSelectedLenderId("");
    }

    function changeSelectedLender(value) {
        setSelectedLenderId(value);
        setError("");
    }

    function validateReassign() {
        if (!reassignTarget) return "No loan selected.";
        if (!selectedLenderId) return "Select a lender.";

        const lenderId = Number(selectedLenderId);

        if (!Number.isInteger(lenderId) || lenderId <= 0) {
            return "Select a valid lender.";
        }

        const lenderExists = lenderUsers.some(
            (option) => option.stakeholder_id === lenderId,
        );

        if (!lenderExists) {
            return "Select a valid lender.";
        }

        if (lenderId === Number(reassignTarget.customer_id)) {
            return "The lender must be different from the customer.";
        }

        return "";
    }

    async function saveReassign() {
        const validationError = validateReassign();

        if (validationError) {
            setError(validationError);
            return false;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await api.patch(`/loans/${reassignTarget.loan_id}`, {
                lender_id: Number(selectedLenderId),
            });

            const loanId = reassignTarget.loan_id;
            setReassignTarget(null);
            setSelectedLenderId("");
            setSuccess(`Lender reassigned for loan ${loanId}.`);
            await fetchLoans();
            return true;
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "Unable to reassign the lender. Please try again.",
            );
            return false;
        } finally {
            setSaving(false);
        }
    }

    function dismissError() {
        setError("");
    }

    function dismissSuccess() {
        setSuccess("");
    }

    return {
        loans,
        lenderUsers,
        loading,
        loadingLenders,
        saving,
        error,
        success,
        reassignTarget,
        selectedLenderId,
        refresh,
        openReassign,
        closeReassign,
        changeSelectedLender,
        saveReassign,
        dismissError,
        dismissSuccess,
    };
}
