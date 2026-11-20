import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FormField from "@/components/loans/create/FormField";

export default function CollateralRow({
  value,
  index,
  onChange,
  onRemove,
  canRemove,
}) {
  return (
    <div className="space-y-4 rounded-lg bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Collateral {index + 1}</p>
        {canRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>

      <FormField
        id={`collateral-description-${index}`}
        label="Description"
      >
        <Textarea
          id={`collateral-description-${index}`}
          value={value.description}
          onChange={(event) => onChange("description", event.target.value)}
          required
        />
      </FormField>

      <FormField
        id={`collateral-value-${index}`}
        label="Estimated value (optional)"
      >
        <Input
          id={`collateral-value-${index}`}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={value.estimated_value}
          onChange={(event) =>
            onChange("estimated_value", event.target.value)
          }
        />
      </FormField>
    </div>
  );
}
