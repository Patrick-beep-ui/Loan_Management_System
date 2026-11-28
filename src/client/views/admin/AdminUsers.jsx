import { Card, CardContent } from "@/components/ui/card";
import AdminUserCreateDialog from "@/components/admin/users/AdminUserCreateDialog";
import AdminUserEditDialog from "@/components/admin/users/AdminUserEditDialog";
import AdminUserResetPasswordDialog from "@/components/admin/users/AdminUserResetPasswordDialog";
import AdminUsersAlerts from "@/components/admin/users/AdminUsersAlerts";
import AdminUsersHeader from "@/components/admin/users/AdminUsersHeader";
import AdminUsersTable from "@/components/admin/users/AdminUsersTable";
import { useAdminUsers } from "@/client/hooks/useAdminUsers";

export default function AdminUsers() {
    const {
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
    } = useAdminUsers();

    return (
        <Card className="mx-auto w-full max-w-6xl">
            <AdminUsersHeader
                description="Create users, reset passwords, and manage roles and access."
                refreshing={loading}
                onRefresh={fetchUsers}
                onCreate={openCreate}
            />
            <CardContent className="space-y-4">
                <AdminUsersAlerts
                    error={error}
                    success={success}
                    onDismissError={dismissError}
                    onDismissSuccess={dismissSuccess}
                />
                <AdminUsersTable
                    users={users}
                    loading={loading}
                    onEdit={openEdit}
                    onReset={openReset}
                />
            </CardContent>
            <AdminUserEditDialog
                user={editingUser}
                formValues={formValues}
                stakeholderValues={stakeholderValues}
                stakeholderFieldErrors={stakeholderFieldErrors}
                stakeholderLoading={stakeholderLoading}
                stakeholderReady={stakeholderReady}
                error={error}
                saving={saving}
                onChange={changeForm}
                onStakeholderChange={changeStakeholderForm}
                onClose={closeEdit}
                onSave={saveEdit}
            />
            <AdminUserCreateDialog
                open={createOpen}
                values={createValues}
                fieldErrors={createFieldErrors}
                stakeholders={availableStakeholders}
                loading={loading}
                error={error}
                saving={creating}
                refreshing={loading}
                credential={
                    credential?.mode === "create" ? credential : null
                }
                onChange={changeCreateForm}
                onClose={closeCreate}
                onRefresh={fetchUsers}
                onSave={saveCreate}
            />
            <AdminUserResetPasswordDialog
                user={resetTarget}
                credential={credential?.mode === "reset" ? credential : null}
                error={error}
                resetting={resetting}
                refreshing={loading}
                onClose={closeReset}
                onRefresh={fetchUsers}
                onConfirm={confirmReset}
            />
        </Card>
    );
}
