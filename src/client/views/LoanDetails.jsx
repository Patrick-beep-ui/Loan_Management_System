import LoanErrorAlert from "@/components/loans/create/ErrorAlert";
import { Card, CardContent } from "@/components/ui/card";
import InstallmentPaymentModal from "@/components/payments/InstallmentPaymentModal";
import InterestPaymentModal from "@/components/payments/InterestPaymentModal";
import PaymentSuccessAlert from "@/components/payments/PaymentSuccessAlert";
import RevertPaymentDialog from "@/components/payments/RevertPaymentDialog";
import DeleteLoanDialog from "@/components/loans/details/DeleteLoanDialog";
import LoanCollateralsList from "@/components/loans/details/LoanCollateralsList";
import LoanDetailsError from "@/components/loans/details/LoanDetailsError";
import LoanDetailsHeader from "@/components/loans/details/LoanDetailsHeader";
import LoanGuarantorsList from "@/components/loans/details/LoanGuarantorsList";
import LoanInstallmentsTable from "@/components/loans/details/LoanInstallmentsTable";
import LoanInterestStatus from "@/components/loans/details/LoanInterestStatus";
import LoanLockedAlert from "@/components/loans/details/LoanLockedAlert";
import LoanSummary from "@/components/loans/details/LoanSummary";
import LoanUpdatedAlert from "@/components/loans/details/LoanUpdatedAlert";
import { useLoanDetails } from "@/client/hooks/useLoanDetails";
import { useLoanPayment } from "@/client/hooks/useLoanPayment";
import { usePaymentRevert } from "@/client/hooks/usePaymentRevert";
import { usePayments } from "@/client/hooks/usePayments";

export default function LoanDetails() {
  const details = useLoanDetails();
  const payments = usePayments({ loanId: details.id });

  async function refreshAll() {
    await Promise.all([details.refreshLoan(), payments.reload()]);
  }

  const payment = useLoanPayment({
    loanId: details.id,
    onPaid: refreshAll,
  });
  const revert = usePaymentRevert({ onReverted: refreshAll });
  const actionsDisabled =
    details.refreshing ||
    payments.loading ||
    payment.submitting ||
    revert.reverting;

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <Card className="mx-auto w-full max-w-6xl">
        <LoanDetailsHeader
          loanId={details.id}
          locked={details.locked}
          onBack={details.goBack}
          onEdit={details.goToEdit}
          onDelete={details.openDelete}
        />

        <CardContent>
          <LoanUpdatedAlert
            visible={details.showUpdated}
            loanId={details.updatedLoanId}
            onDismiss={details.dismissUpdated}
          />
          <PaymentSuccessAlert
            visible={Boolean(payment.success)}
            message={payment.success}
            onDismiss={payment.dismissSuccess}
          />
          <PaymentSuccessAlert
            visible={Boolean(revert.success)}
            message={revert.success}
            onDismiss={revert.dismissSuccess}
          />
          <LoanErrorAlert message={payments.error} />
          <LoanDetailsError
            error={details.error}
            notFound={details.notFound}
            onRetry={details.fetchLoan}
            onBack={details.goBack}
          />

          {details.loading ? (
            <p className="text-muted-foreground">Loading loan...</p>
          ) : (
            details.loan && (
              <div className="space-y-8">
                {details.locked && <LoanLockedAlert />}
                <LoanSummary loan={details.loan} />
                <LoanInstallmentsTable
                  installments={details.loan.installments}
                  focusInstallmentId={details.focusInstallmentId}
                  payments={payments.payments}
                  onPay={payment.openInstallment}
                  onRevert={(recordedPayment, installment) =>
                    revert.open({
                      paymentId: recordedPayment.payment_id,
                      label: `Installment #${installment.installment_number}`,
                      amount: recordedPayment.amount,
                      paidAt: recordedPayment.paid_at,
                    })
                  }
                  paymentDisabled={actionsDisabled}
                />
                <div className="grid gap-8 lg:grid-cols-2">
                  <LoanGuarantorsList
                    guarantors={details.loan.guarantors}
                  />
                  <LoanCollateralsList
                    collaterals={details.loan.collaterals}
                  />
                </div>
                <LoanInterestStatus
                  loan={details.loan}
                  payments={payments.payments}
                  onPay={payment.openInterest}
                  onRevert={(recordedPayment) =>
                    revert.open({
                      paymentId: recordedPayment.payment_id,
                      label: "Ordinary interest",
                      amount: recordedPayment.amount,
                      paidAt: recordedPayment.paid_at,
                    })
                  }
                  paymentDisabled={actionsDisabled}
                />
              </div>
            )
          )}
        </CardContent>
      </Card>

      <DeleteLoanDialog
        open={details.showDelete}
        loanId={details.id}
        error={details.deleteError}
        deleting={details.deleting}
        onClose={details.closeDelete}
        onConfirm={details.confirmDelete}
      />

      <InstallmentPaymentModal
        isOpen={payment.isInstallmentOpen}
        onClose={payment.close}
        loanId={details.id}
        installment={payment.target}
        paidAt={payment.paidAt}
        onPaidAtChange={payment.setPaidAt}
        error={payment.error}
        submitting={payment.submitting}
        onConfirm={payment.confirmPayment}
      />

      <InterestPaymentModal
        isOpen={payment.isInterestOpen}
        onClose={payment.close}
        loanId={details.id}
        interest={payment.target}
        paidAt={payment.paidAt}
        onPaidAtChange={payment.setPaidAt}
        error={payment.error}
        submitting={payment.submitting}
        onConfirm={payment.confirmPayment}
      />

      <RevertPaymentDialog
        open={revert.isOpen}
        target={revert.target}
        error={revert.error}
        reverting={revert.reverting}
        onClose={revert.close}
        onConfirm={revert.confirmRevert}
      />
    </main>
  );
}
