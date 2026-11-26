import { useEffect, useState } from "react";

import api from "@/lib/axiosService";
import { buildAdminUserPayload } from "@/client/utils/userForm";
import {
    buildStakeholderPayload,
    EMPTY_STAKEHOLDER_FORM,
    stakeholderToForm,
    validateStakeholderForm,
} from "@/client/utils/stakeholderForm";

export function useAdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [formValues, setFormValues] = useState({
        role_name: "lender",
        is_active: true,
    });
    const [stakeholderValues, setStakeholderValues] = useState({
        ...EMPTY_STAKEHOLDER_FORM,
    });
    const [stakeholderFieldErrors, setStakeholderFieldErrors] = useState({});
    const [stakeholderLoading, setStakeholderLoading] = useState(false);
    const [stakeholderReady, setStakeholderReady] = useState(false);

    async function fetchUsers() {
        setError("");
        setLoading(true);

        try {
            const { data } = await api.get("/users");
            setUsers(Array.isArray(data) ? data : []);
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "Unable to load users. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    async function openEdit(user) {
        setError("");
        setSuccess("");
        setEditingUser(user);
        setFormValues({
            role_name: user.Role?.role_name || "lender",
            is_active: Boolean(user.is_active),
        });
        setStakeholderValues({ ...EMPTY_STAKEHOLDER_FORM });
        setStakeholderFieldErrors({});
        setStakeholderReady(false);

        const stakeholderId = user?.stakeholder_id;
        if (!stakeholderId) {
            setStakeholderLoading(false);
            return;
        }

        setStakeholderLoading(true);
        try {
            const { data } = await api.get(`/stakeholders/${stakeholderId}`);
            setStakeholderValues(stakeholderToForm(data));
            setStakeholderReady(true);
        } catch (requestError) {
            setError(
                "Unable to load stakeholder details. Only role and status can be edited.",
            );
        } finally {
            setStakeholderLoading(false);
        }
    }

    function closeEdit() {
        setEditingUser(null);
    }

    function changeForm(field, value) {
        setFormValues((current) => ({ ...current, [field]: value }));
    }

    function changeStakeholderForm(field, value) {
        setStakeholderValues((current) => ({ ...current, [field]: value }));
        setStakeholderFieldErrors({});
    }

    async function saveEdit() {
        if (!editingUser) return false;

        const shouldUpdateStakeholder = Boolean(
            editingUser.stakeholder_id && stakeholderReady,
        );

        if (shouldUpdateStakeholder) {
            const validationErrors = validateStakeholderForm(stakeholderValues);
            if (Object.keys(validationErrors).length > 0) {
                setStakeholderFieldErrors(validationErrors);
                return false;
            }
        }

        setSaving(true);
        setError("");
        setSuccess("");
        setStakeholderFieldErrors({});

        let accountUpdated = false;

        try {
            await api.patch(
                `/admin/users/${editingUser.user_id}`,
                buildAdminUserPayload(formValues),
            );
            accountUpdated = true;

            if (shouldUpdateStakeholder) {
                await api.put(
                    `/stakeholders/${editingUser.stakeholder_id}`,
                    buildStakeholderPayload(stakeholderValues),
                );
            }

            setEditingUser(null);
            await fetchUsers();
            setSuccess(
                shouldUpdateStakeholder
                    ? `Updated ${editingUser.email} and stakeholder details.`
                    : `Updated ${editingUser.email}.`,
            );
            return true;
        } catch (requestError) {
            const message =
                requestError.response?.data?.error ||
                "Unable to update user. Please try again.";

            if (accountUpdated) {
                await fetchUsers();
                setError(
                    `Account status updated, but stakeholder details were not saved: ${message}`,
                );
            } else {
                setError(message);
            }
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
        users,
        loading,
        saving,
        error,
        success,
        editingUser,
        formValues,
        stakeholderValues,
        stakeholderFieldErrors,
        stakeholderLoading,
        stakeholderReady,
        fetchUsers,
        openEdit,
        closeEdit,
        changeForm,
        changeStakeholderForm,
        saveEdit,
        dismissError,
        dismissSuccess,
    };
}
