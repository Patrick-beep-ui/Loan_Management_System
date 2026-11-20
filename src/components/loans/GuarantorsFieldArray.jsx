import { Button } from "@/components/ui/button";
import GuarantorRow from "@/components/loans/GuarantorRow";

export default function GuarantorsFieldArray({
  values,
  stakeholders,
  loadingStakeholders,
  stakeholderPlaceholder,
  onChange,
  onAdd,
  onRemove,
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-medium">Guarantors</h3>
          <p className="text-sm text-muted-foreground">
            At least one guarantor is required.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          Add guarantor
        </Button>
      </div>

      {values.map((row, index) => (
        <GuarantorRow
          key={index}
          value={row}
          index={index}
          stakeholders={stakeholders}
          loadingStakeholders={loadingStakeholders}
          stakeholderPlaceholder={stakeholderPlaceholder}
          onChange={(field, value) => onChange(index, field, value)}
          onRemove={() => onRemove(index)}
          canRemove={values.length > 1}
        />
      ))}
    </div>
  );
}
