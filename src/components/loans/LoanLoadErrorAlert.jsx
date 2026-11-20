import { Button } from "@/components/ui/button";

export default function LoanLoadErrorAlert({ message, onRetry }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-4 flex flex-col gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
    >
      <span>{message}</span>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
