import { formatAmount, formatDate } from "@/client/utils/loanFormat";
import { interestPaymentRecord } from "@/client/utils/loanEdit";

export default function LoanInterestStatus({ loan }) {
  const isSeparate = loan.interest_payment_mode === "separate";
  const obligation = loan.interestPayment;
  const payment = interestPaymentRecord(loan);
  const status = obligation
    ? obligation.status
    : isSeparate
      ? "Missing obligation"
      : "Not applicable";

  return (
    <section className="space-y-3">
      <h3 className="font-medium">Ordinary interest</h3>
      <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:grid-cols-3">
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
      </div>
    </section>
  );
}
