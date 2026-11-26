import { useEffect, useState } from "react";

import api from "@/lib/axiosService";
import { buildAdminUserPayload } from "@/client/utils/userForm";

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

    function openEdit(user) {
        setError("");
        setSuccess("");
        setEditingUser(user);
        setFormValues({
            role_name: user.Role?.role_name || "lender",
            is_active: Boolean(user.is_active),
        });
    }

    function closeEdit() {
        setEditingUser(null);
    }

    function changeForm(field, value) {
        setFormValues((current) => ({ ...current, [field]: value }));
    }

    async function saveEdit() {
        if (!editingUser) return false;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = buildAdminUserPayload(formValues);
            const { data } = await api.patch(
                `/admin/users/${editingUser.user_id}`,
                payload,
            );

            setUsers((current) =>
                current.map((user) =>
                    user.user_id === data.user_id ? data : user,
                ),
            );
            setSuccess(`Updated ${editingUser.email}.`);
            setEditingUser(null);
            return true;
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "Unable to update user. Please try again.",
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
        users,
        loading,
        saving,
        error,
        success,
        editingUser,
        formValues,
        fetchUsers,
        openEdit,
        closeEdit,
        changeForm,
        saveEdit,
        dismissError,
        dismissSuccess,
    };
}
