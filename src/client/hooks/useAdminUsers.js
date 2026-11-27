import { useEffect, useState } from "react";

import api from "@/lib/axiosService";
import {
    buildAdminUserCreatePayload,
    buildAdminUserPayload,
    EMPTY_ADMIN_USER_CREATE_FORM,
    validateAdminUserCreateForm,
} from "@/client/utils/userForm";
import {
    buildStakeholderPayload,
    EMPTY_STAKEHOLDER_FORM,
    stakeholderToForm,
    validateStakeholderForm,
} from "@/client/utils/stakeholderForm";

export function useAdminUsers() {
    const [users, setUsers] = useState([]);
    const [availableStakeholders, setAvailableStakeholders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [createValues, setCreateValues] = useState({
        ...EMPTY_ADMIN_USER_CREATE_FORM,
    });
    const [createFieldErrors, setCreateFieldErrors] = useState({});
    const [resetTarget, setResetTarget] = useState(null);
    const [credential, setCredential] = useState(null);
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
            const [usersResponse, stakeholdersResponse] = await Promise.all([
                api.get("/users"),
                api.get("/stakeholders"),
            ]);
            const fetchedUsers = Array.isArray(usersResponse.data)
                ? usersResponse.data
                : [];
            setUsers(fetchedUsers);

            const linkedStakeholderIds = new Set(
                fetchedUsers
                    .map((user) => user.stakeholder_id)
                    .filter((stakeholderId) => stakeholderId),
            );
            const stakeholders = Array.isArray(stakeholdersResponse.data)
                ? stakeholdersResponse.data
                : [];
            setAvailableStakeholders(
                stakeholders.filter(
                    (stakeholder) =>
                        !linkedStakeholderIds.has(stakeholder.stakeholder_id),
                ),
            );
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

    function openCreate() {
        setError("");
        setSuccess("");
        setCreateValues({ ...EMPTY_ADMIN_USER_CREATE_FORM });
        setCreateFieldErrors({});
        setCredential(null);
        setCreateOpen(true);
    }

    function closeCreate() {
        setCreateOpen(false);
        setCreateFieldErrors({});
        setCredential(null);
    }

    function changeCreateForm(field, value) {
        setCreateValues((current) => ({ ...current, [field]: value }));
        setCreateFieldErrors({});
    }

    async function saveCreate() {
        if (!createOpen) return false;

        const validationErrors = validateAdminUserCreateForm(createValues);
        if (Object.keys(validationErrors).length > 0) {
            setCreateFieldErrors(validationErrors);
            return false;
        }

        setCreating(true);
        setError("");
        setSuccess("");
        setCreateFieldErrors({});

        try {
            const { data } = await api.post(
                "/admin/users",
                buildAdminUserCreatePayload(createValues),
            );
            setCredential({
                mode: "create",
                user: data,
                password: data.temporary_password,
            });
            await fetchUsers();
            setSuccess(
                `Created ${data.email || "the user"}. Save the temporary password now.`,
            );
            return true;
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "Unable to create user. Please try again.",
            );
            return false;
        } finally {
            setCreating(false);
        }
    }

    function openReset(user) {
        setError("");
        setSuccess("");
        setResetTarget(user);
        setCredential(null);
    }

    function closeReset() {
        setResetTarget(null);
        setCredential(null);
    }

    async function confirmReset() {
        if (!resetTarget) return false;

        setResetting(true);
        setError("");
        setSuccess("");

        try {
            const { data } = await api.post(
                `/admin/users/${resetTarget.user_id}/reset-password`,
            );
            setCredential({
                mode: "reset",
                user: data,
                password: data.temporary_password,
            });
            await fetchUsers();
            setSuccess(
                `Password reset for ${data.email || resetTarget.email}. Save the temporary password now.`,
            );
            return true;
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "Unable to reset password. Please try again.",
            );
            return false;
        } finally {
            setResetting(false);
        }
    }

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
        availableStakeholders,
        loading,
        saving,
        creating,
        resetting,
        error,
        success,
        editingUser,
        createOpen,
        createValues,
        createFieldErrors,
        resetTarget,
        credential,
        formValues,
        stakeholderValues,
        stakeholderFieldErrors,
        stakeholderLoading,
        stakeholderReady,
        fetchUsers,
        openCreate,
        closeCreate,
        changeCreateForm,
        saveCreate,
        openReset,
        closeReset,
        confirmReset,
        openEdit,
        closeEdit,
        changeForm,
        changeStakeholderForm,
        saveEdit,
        dismissError,
        dismissSuccess,
    };
}
