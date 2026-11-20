import { Button } from "@/components/ui/button";

export default function LoanDeletedAlert({
  visible,
  deletedLoanId,
  onDismiss,
}) {
  if (!visible) return null;

  return (
    <div
      role="status"
      className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <span>Loan #{deletedLoanId} was deleted.</span>
      <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  );
}
