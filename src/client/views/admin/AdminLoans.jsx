import { Card, CardContent } from "@/components/ui/card";
import AdminLoansAlerts from "@/components/admin/loans/AdminLoansAlerts";
import AdminLoansHeader from "@/components/admin/loans/AdminLoansHeader";
import AdminLoansTable from "@/components/admin/loans/AdminLoansTable";
import ReassignLenderDialog from "@/components/admin/loans/ReassignLenderDialog";
import { useAdminLoans } from "@/client/hooks/useAdminLoans";

export default function AdminLoans() {
    const {
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
    } = useAdminLoans();

    return (
        <Card className="mx-auto w-full max-w-6xl">
            <AdminLoansHeader refreshing={loading} onRefresh={refresh} />
            <CardContent className="space-y-4">
                <AdminLoansAlerts
                    error={error}
                    success={success}
                    onDismissError={dismissError}
                    onDismissSuccess={dismissSuccess}
                />
                <AdminLoansTable
                    loans={loans}
                    loading={loading}
                    onReassign={openReassign}
                />
            </CardContent>
            <ReassignLenderDialog
                loan={reassignTarget}
                lenderUsers={lenderUsers}
                loadingLenders={loadingLenders}
                selectedLenderId={selectedLenderId}
                error={error}
                saving={saving}
                onSelect={changeSelectedLender}
                onClose={closeReassign}
                onSave={saveReassign}
            />
        </Card>
    );
}
