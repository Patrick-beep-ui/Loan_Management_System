export default function LoanLockedAlert() {
  return (
    <div
      role="status"
      className="mb-6 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground"
    >
      This loan has recorded payments. Financial terms, customer, disbursement
      date, and installments are locked; guarantors and collateral remain
      editable, and admins can change the lender.
    </div>
  );
}
