import { useEffect, useMemo, useState } from "react";

import api from "@/lib/axiosService";
import {
    categorizeStakeholders,
    countStakeholderCategories,
    filterStakeholdersByCategory,
} from "@/client/utils/stakeholderCategory";
import {
    buildStakeholderPayload,
    EMPTY_STAKEHOLDER_FORM,
    stakeholderToForm,
    validateStakeholderForm,
} from "@/client/utils/stakeholderForm";

export function useAdminStakeholders() {
    const [stakeholders, setStakeholders] = useState([]);
    const [category, setCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formMode, setFormMode] = useState(null);
    const [editingStakeholder, setEditingStakeholder] = useState(null);
    const [formValues, setFormValues] = useState({
        ...EMPTY_STAKEHOLDER_FORM,
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);

    async function fetchStakeholders() {
        setError("");
        setLoading(true);

        try {
            const [stakeholdersResponse, usersResponse] = await Promise.all([
                api.get("/stakeholders"),
                api.get("/users"),
            ]);
            const people = Array.isArray(stakeholdersResponse.data)
                ? stakeholdersResponse.data
                : [];
            const users = Array.isArray(usersResponse.data)
                ? usersResponse.data
                : [];

            setStakeholders(categorizeStakeholders(people, users));
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "Unable to load stakeholders. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStakeholders();
    }, []);

    function openCreate() {
        setError("");
        setSuccess("");
        setEditingStakeholder(null);
        setFormValues({ ...EMPTY_STAKEHOLDER_FORM });
        setFieldErrors({});
        setFormMode("create");
    }

    function openEdit(stakeholder) {
        setError("");
        setSuccess("");
        setEditingStakeholder(stakeholder);
        setFormValues(stakeholderToForm(stakeholder));
        setFieldErrors({});
        setFormMode("edit");
    }

    function closeForm() {
        setFormMode(null);
        setFieldErrors({});
    }

    function changeForm(field, value) {
        setFormValues((current) => ({ ...current, [field]: value }));
        setFieldErrors({});
    }

    async function saveForm() {
        if (!formMode) return false;

        const validationErrors = validateStakeholderForm(formValues);
        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return false;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = buildStakeholderPayload(formValues);

            if (formMode === "create") {
                await api.post("/stakeholders", payload);
                setSuccess("Stakeholder created.");
            } else {
                await api.put(
                    `/stakeholders/${editingStakeholder.stakeholder_id}`,
                    payload,
                );
                setSuccess("Stakeholder updated.");
            }

            setFormMode(null);
            await fetchStakeholders();
            return true;
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "Unable to save stakeholder. Please try again.",
            );
            return false;
        } finally {
            setSaving(false);
        }
    }

    function openDelete(stakeholder) {
        setError("");
        setSuccess("");
        setDeleteTarget(stakeholder);
    }

    function closeDelete() {
        setDeleteTarget(null);
    }

    async function confirmDelete() {
        if (!deleteTarget) return false;

        setDeleting(true);
        setError("");
        setSuccess("");

        try {
            await api.delete(`/stakeholders/${deleteTarget.stakeholder_id}`);
            setDeleteTarget(null);
            setSuccess("Stakeholder deleted.");
            await fetchStakeholders();
            return true;
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "Unable to delete stakeholder. Please try again.",
            );
            return false;
        } finally {
            setDeleting(false);
        }
    }

    const categoryCounts = useMemo(
        () => countStakeholderCategories(stakeholders),
        [stakeholders],
    );
    const filteredStakeholders = useMemo(
        () => filterStakeholdersByCategory(stakeholders, category),
        [stakeholders, category],
    );

    function dismissError() {
        setError("");
    }

    function dismissSuccess() {
        setSuccess("");
    }

    return {
        stakeholders,
        filteredStakeholders,
        category,
        setCategory,
        categoryCounts,
        loading,
        saving,
        deleting,
        error,
        success,
        formMode,
        editingStakeholder,
        formValues,
        fieldErrors,
        deleteTarget,
        fetchStakeholders,
        openCreate,
        openEdit,
        closeForm,
        changeForm,
        saveForm,
        openDelete,
        closeDelete,
        confirmDelete,
        dismissError,
        dismissSuccess,
    };
}
