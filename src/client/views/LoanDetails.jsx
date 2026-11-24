import { Card, CardContent } from "@/components/ui/card";
import InstallmentPaymentModal from "@/components/payments/InstallmentPaymentModal";
import InterestPaymentModal from "@/components/payments/InterestPaymentModal";
import PaymentSuccessAlert from "@/components/payments/PaymentSuccessAlert";
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

export default function LoanDetails() {
  const details = useLoanDetails();
  const payment = useLoanPayment({
    loanId: details.id,
    onPaid: details.refreshLoan,
  });

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
                  onPay={payment.openInstallment}
                  paymentDisabled={details.refreshing}
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
                  onPay={payment.openInterest}
                  paymentDisabled={details.refreshing}
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
    </main>
  );
}
