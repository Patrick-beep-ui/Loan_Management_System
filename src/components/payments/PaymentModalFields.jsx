import { formatAmount } from "@/client/utils/loanFormat";
import FormField from "@/components/loans/create/FormField";
import ErrorAlert from "@/components/loans/create/ErrorAlert";
import { Input } from "@/components/ui/input";

export default function PaymentModalFields({
  amount,
  paidAt,
  onPaidAtChange,
  error,
}) {
  return (
    <div className="space-y-4">
      <ErrorAlert message={error} />

      <FormField id="payment-amount" label="Amount">
        <Input
          id="payment-amount"
          value={
            amount === undefined || amount === null ? "" : formatAmount(amount)
          }
          readOnly
          className="tabular-nums"
        />
      </FormField>

      <FormField id="payment-paid-at" label="Payment date and time (optional)">
        <Input
          id="payment-paid-at"
          type="datetime-local"
          value={paidAt}
          onChange={(event) => onPaidAtChange(event.target.value)}
        />
      </FormField>

      <p className="text-xs text-muted-foreground">
        Leave blank to use the current server time.
      </p>
    </div>
  );
}
