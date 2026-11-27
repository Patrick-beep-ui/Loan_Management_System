import { useState } from "react";

import { useAuth } from "@/client/contexts/AuthContext";
import api from "@/lib/axiosService";

export function useChangePassword() {
    const { refreshUser } = useAuth();
    const [values, setValues] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function change(field, value) {
        setValues((current) => ({ ...current, [field]: value }));
        setFieldErrors({});
        setError("");
    }

    async function submit() {
        setError("");
        setSuccess("");
        setFieldErrors({});

        const nextErrors = {};
        if (!values.current_password.trim()) {
            nextErrors.current_password = "Current password is required.";
        }
        if (!values.new_password.trim()) {
            nextErrors.new_password = "New password is required.";
        }
        if (!values.confirm_password.trim()) {
            nextErrors.confirm_password = "Please confirm the new password.";
        }
        if (
            values.new_password &&
            values.confirm_password &&
            values.new_password !== values.confirm_password
        ) {
            nextErrors.confirm_password = "Passwords do not match.";
        }

        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            return false;
        }

        setSubmitting(true);

        try {
            await api.patch("/users/me/password", {
                current_password: values.current_password,
                new_password: values.new_password,
            });
            await refreshUser();
            setSuccess("Password changed successfully.");
            return true;
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "Unable to change password. Please try again.",
            );
            return false;
        } finally {
            setSubmitting(false);
        }
    }

    return {
        values,
        fieldErrors,
        error,
        success,
        submitting,
        change,
        submit,
    };
}
