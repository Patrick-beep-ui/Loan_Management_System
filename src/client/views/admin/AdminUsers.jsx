import { Card, CardContent } from "@/components/ui/card";
import AdminUserEditDialog from "@/components/admin/users/AdminUserEditDialog";
import AdminUsersAlerts from "@/components/admin/users/AdminUsersAlerts";
import AdminUsersHeader from "@/components/admin/users/AdminUsersHeader";
import AdminUsersTable from "@/components/admin/users/AdminUsersTable";
import { useAdminUsers } from "@/client/hooks/useAdminUsers";

export default function AdminUsers() {
    const {
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
    } = useAdminUsers();

    return (
        <Card className="mx-auto w-full max-w-6xl">
            <AdminUsersHeader
                description="Review accounts, edit linked people, and enable or disable access."
                refreshing={loading}
                onRefresh={fetchUsers}
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
        </Card>
    );
}
