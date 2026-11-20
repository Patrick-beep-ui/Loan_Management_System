import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { stakeholderName } from "@/client/utils/loanForm";
import FormField from "@/components/loans/FormField";

export default function LoanDetailsFields({
  form,
  onChange,
  stakeholders,
  loadingStakeholders,
  isAdmin,
  user,
  customerOptions,
  stakeholderPlaceholder,
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField id="lender" label="Lender">
        {isAdmin ? (
          <Select
            value={form.lender_id}
            onValueChange={(value) => onChange("lender_id", value)}
          >
            <SelectTrigger id="lender" className="w-full">
              <SelectValue placeholder={stakeholderPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {stakeholders.map((stakeholder) => (
                <SelectItem
                  key={stakeholder.stakeholder_id}
                  value={String(stakeholder.stakeholder_id)}
                >
                  {stakeholderName(stakeholder)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="lender"
            value={
              user?.Stakeholder
                ? stakeholderName(user.Stakeholder)
                : `Stakeholder #${user?.stakeholder_id ?? "—"}`
            }
            disabled
            readOnly
          />
        )}
      </FormField>

      <FormField id="customer_id" label="Customer">
        <Select
          value={form.customer_id}
          onValueChange={(value) => onChange("customer_id", value)}
        >
          <SelectTrigger
            id="customer_id"
            className="w-full"
            disabled={loadingStakeholders}
          >
            <SelectValue placeholder={stakeholderPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {customerOptions.map((stakeholder) => (
              <SelectItem
                key={stakeholder.stakeholder_id}
                value={String(stakeholder.stakeholder_id)}
              >
                {stakeholderName(stakeholder)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="loan_amount" label="Loan amount">
        <Input
          id="loan_amount"
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          placeholder="10000.00"
          value={form.loan_amount}
          onChange={(event) => onChange("loan_amount", event.target.value)}
          required
        />
      </FormField>

      <FormField id="interest_rate" label="Interest rate (%)">
        <Input
          id="interest_rate"
          type="number"
          min="0"
          max="999.9999"
          step="0.0001"
          inputMode="decimal"
          placeholder="12"
          value={form.interest_rate}
          onChange={(event) => onChange("interest_rate", event.target.value)}
        />
      </FormField>

      <FormField id="interest_payment_mode" label="Interest mode">
        <Select
          value={form.interest_payment_mode}
          onValueChange={(value) => onChange("interest_payment_mode", value)}
        >
          <SelectTrigger id="interest_payment_mode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="included">Included in installments</SelectItem>
            <SelectItem value="separate">Billed separately</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="disbursed_at" label="Disbursed at">
        <Input
          id="disbursed_at"
          type="datetime-local"
          value={form.disbursed_at}
          onChange={(event) => onChange("disbursed_at", event.target.value)}
          required
        />
      </FormField>

      <FormField id="installment_count" label="Number of installments">
        <Input
          id="installment_count"
          type="number"
          min="1"
          max="360"
          step="1"
          inputMode="numeric"
          value={form.installment_count}
          onChange={(event) => onChange("installment_count", event.target.value)}
          required
        />
      </FormField>

      <FormField id="first_due_date" label="First due date">
        <Input
          id="first_due_date"
          type="date"
          min={form.disbursed_at.slice(0, 10) || undefined}
          value={form.first_due_date}
          onChange={(event) => onChange("first_due_date", event.target.value)}
          required
        />
      </FormField>
    </div>
  );
}
