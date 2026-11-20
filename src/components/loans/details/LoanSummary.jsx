import {
  formatAmount,
  formatDate,
  formatRate,
  fullName,
} from "@/client/utils/loanFormat";

function SummaryItem({ label, value }) {
  return (
    <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function LoanSummary({ loan }) {
  const mode =
    loan.interest_payment_mode === "separate"
      ? "Billed separately"
      : "Included in installments";

  return (
    <section className="space-y-3">
      <h3 className="font-medium">Summary</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryItem label="Lender" value={fullName(loan.lender)} />
        <SummaryItem label="Customer" value={fullName(loan.customer)} />
        <SummaryItem label="Loan amount" value={formatAmount(loan.loan_amount)} />
        <SummaryItem label="Interest rate" value={formatRate(loan.interest_rate)} />
        <SummaryItem label="Interest mode" value={mode} />
        <SummaryItem label="Disbursed" value={formatDate(loan.disbursed_at)} />
        <SummaryItem label="Interest amount" value={formatAmount(loan.interest_amount)} />
        <SummaryItem label="Total to pay" value={formatAmount(loan.total_to_pay)} />
        <SummaryItem label="Installments" value={loan.installments?.length ?? 0} />
      </div>
    </section>
  );
}
