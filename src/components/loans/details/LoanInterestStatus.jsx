import { Button } from "@/components/ui/button";
import { formatAmount, formatDate } from "@/client/utils/loanFormat";
import { interestPaymentRecord } from "@/client/utils/loanEdit";
import { findInterestPayment } from "@/client/utils/paymentHistory";

export default function LoanInterestStatus({
  loan,
  payments = [],
  onPay,
  onRevert,
  paymentDisabled,
}) {
  const isSeparate = loan.interest_payment_mode === "separate";
  const obligation = loan.interestPayment;
  const recordedPayment = findInterestPayment(payments, loan.loan_id);
  const payment = recordedPayment || interestPaymentRecord(loan);
  const status = obligation
    ? obligation.status
    : isSeparate
      ? "Missing obligation"
      : "Not applicable";
  const isPaid =
    String(status).toLowerCase() === "paid" || Boolean(payment);
  const canPay =
    isSeparate && Boolean(obligation) && !isPaid && !paymentDisabled;

  return (
    <section className="space-y-3">
      <h3 className="font-medium">Ordinary interest</h3>
      <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Interest amount</p>
          <p className="font-medium tabular-nums">
            {formatAmount(loan.interest_amount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Separate obligation</p>
          <p className="font-medium">{status}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Payment recorded</p>
          <p className="font-medium">
            {payment
              ? `${formatAmount(payment.amount)} on ${formatDate(payment.paid_at)}`
              : "—"}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Action</p>
          {isPaid ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => onRevert(recordedPayment)}
              disabled={!recordedPayment || paymentDisabled}
            >
              Revert interest
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onPay(loan)}
              disabled={!canPay}
            >
              Pay interest
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
