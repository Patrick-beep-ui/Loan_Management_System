import { Button } from "@/components/ui/button";

export default function EditLoanError({ error, notFound, onRetry, onBack }) {
  if (notFound) {
    return (
      <div
        role="alert"
        className="mb-6 flex flex-col gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
      >
        <span>Loan not found.</span>
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          Back to loans
        </Button>
      </div>
    );
  }

  if (!error) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex flex-col gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
    >
      <span>{error}</span>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
