import { Card, CardContent } from "@/components/ui/card";
import AdminPaymentRecordDialog from "@/components/admin/payments/AdminPaymentRecordDialog";
import AdminPaymentsAlerts from "@/components/admin/payments/AdminPaymentsAlerts";
import AdminPaymentsHeader from "@/components/admin/payments/AdminPaymentsHeader";
import AdminPaymentsTable from "@/components/admin/payments/AdminPaymentsTable";
import RevertPaymentDialog from "@/components/payments/RevertPaymentDialog";
import { useAdminPayments } from "@/client/hooks/useAdminPayments";

export default function AdminPayments() {
  const {
    payments,
    loading,
    loadingLoans,
    error,
    success,
    dismissError,
    dismissSuccess,
    refresh,
    revert,
    openRevert,
    recordOpen,
    loanOptions,
    selectedLoanId,
    targetOptions,
    selectedTargetKey,
    selectedTarget,
    paidAt,
    recordError,
    submitting,
    openRecord,
    closeRecord,
    changeLoan,
    changeTarget,
    changePaidAt,
    confirmRecord,
  } = useAdminPayments();

  const actionsDisabled = loading || submitting || revert.reverting;

  return (
    <Card className="mx-auto w-full max-w-6xl">
      <AdminPaymentsHeader
        refreshing={loading || loadingLoans}
        recording={submitting}
        onRefresh={refresh}
        onRecord={openRecord}
      />
      <CardContent className="space-y-4">
        <AdminPaymentsAlerts
          error={error}
          success={success}
          revertSuccess={revert.success}
          onDismissError={dismissError}
          onDismissSuccess={dismissSuccess}
          onDismissRevertSuccess={revert.dismissSuccess}
        />
        <AdminPaymentsTable
          payments={payments}
          loading={loading}
          onRevert={openRevert}
          actionsDisabled={actionsDisabled}
        />
      </CardContent>

      <AdminPaymentRecordDialog
        open={recordOpen}
        loanOptions={loanOptions}
        targetOptions={targetOptions}
        selectedLoanId={selectedLoanId}
        selectedTargetKey={selectedTargetKey}
        selectedTarget={selectedTarget}
        paidAt={paidAt}
        error={recordError}
        loadingLoans={loadingLoans}
        submitting={submitting}
        onLoanChange={changeLoan}
        onTargetChange={changeTarget}
        onPaidAtChange={changePaidAt}
        onClose={closeRecord}
        onConfirm={confirmRecord}
      />

      <RevertPaymentDialog
        open={revert.isOpen}
        target={revert.target}
        error={revert.error}
        reverting={revert.reverting}
        onClose={revert.close}
        onConfirm={revert.confirmRevert}
      />
    </Card>
  );
}
