export default function LoanLockedAlert() {
  return (
    <div
      role="status"
      className="mb-6 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground"
    >
      This loan has recorded payments. Revert a payment to make editing and
      deletion available again.
    </div>
  );
}
