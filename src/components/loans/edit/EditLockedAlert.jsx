export default function EditLockedAlert() {
  return (
    <div
      role="status"
      className="mb-6 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground"
    >
      This loan has recorded payments. You can update guarantors and collateral;
      admins can also change the lender.
    </div>
  );
}
