import PaymentRecordDialog from "@/components/admin/payments/AdminPaymentRecordDialog";
import ErrorAlert from "@/components/loans/create/ErrorAlert";
import PaymentSuccessAlert from "@/components/payments/PaymentSuccessAlert";
import PaymentsHeader from "@/components/payments/PaymentsHeader";
import PaymentsTable from "@/components/payments/PaymentsTable";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminPayments } from "@/client/hooks/useAdminPayments";

export default function Payments() {
  const {
    payments,
    loading,
    loadingLoans,
    error,
    success,
    dismissSuccess,
    refresh,
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

  return (
    <Card className="mx-auto w-full max-w-6xl">
      <PaymentsHeader
        refreshing={loading || loadingLoans}
        recording={submitting}
        onRefresh={refresh}
        onRecord={openRecord}
      />
      <CardContent className="space-y-4">
        <PaymentSuccessAlert
          visible={Boolean(success)}
          message={success}
          onDismiss={dismissSuccess}
        />
        <ErrorAlert message={error} />
        <PaymentsTable payments={payments} loading={loading} />
      </CardContent>

      <PaymentRecordDialog
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
    </Card>
  );
}
