export default function LoanLockedAlert() {
  return (
    <div
      role="status"
      className="mb-6 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground"
    >
      This loan has installment or interest payments. Editing and deletion are
      unavailable while payments are recorded.
    </div>
  );
}
