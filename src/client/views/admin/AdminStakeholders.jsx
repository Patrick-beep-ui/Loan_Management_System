import { Card, CardContent } from "@/components/ui/card";
import AdminStakeholderFormDialog from "@/components/admin/stakeholders/AdminStakeholderFormDialog";
import AdminStakeholdersAlerts from "@/components/admin/stakeholders/AdminStakeholdersAlerts";
import AdminStakeholdersFilter from "@/components/admin/stakeholders/AdminStakeholdersFilter";
import AdminStakeholdersHeader from "@/components/admin/stakeholders/AdminStakeholdersHeader";
import AdminStakeholdersTable from "@/components/admin/stakeholders/AdminStakeholdersTable";
import DeleteStakeholderDialog from "@/components/admin/stakeholders/DeleteStakeholderDialog";
import { useAdminStakeholders } from "@/client/hooks/useAdminStakeholders";

export default function AdminStakeholders() {
    const {
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
    } = useAdminStakeholders();

    return (
        <Card className="mx-auto w-full max-w-6xl">
            <AdminStakeholdersHeader
                refreshing={loading}
                onRefresh={fetchStakeholders}
                onCreate={openCreate}
            />
            <CardContent className="space-y-4">
                <AdminStakeholdersAlerts
                    error={error}
                    success={success}
                    onDismissError={dismissError}
                    onDismissSuccess={dismissSuccess}
                />
                <AdminStakeholdersFilter
                    category={category}
                    counts={categoryCounts}
                    onChange={setCategory}
                />
                <AdminStakeholdersTable
                    stakeholders={filteredStakeholders}
                    loading={loading}
                    emptyMessage={
                        category === "all"
                            ? "No stakeholders found."
                            : "No stakeholders in this category."
                    }
                    onEdit={openEdit}
                    onDelete={openDelete}
                />
            </CardContent>
            <AdminStakeholderFormDialog
                mode={formMode}
                values={formValues}
                fieldErrors={fieldErrors}
                error={error}
                saving={saving}
                onChange={changeForm}
                onClose={closeForm}
                onSave={saveForm}
            />
            <DeleteStakeholderDialog
                stakeholder={deleteTarget}
                error={error}
                deleting={deleting}
                onClose={closeDelete}
                onConfirm={confirmDelete}
            />
        </Card>
    );
}
