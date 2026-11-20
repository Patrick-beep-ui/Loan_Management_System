import { Button } from "@/components/ui/button";
import CollateralRow from "@/components/loans/CollateralRow";

export default function CollateralsFieldArray({
  values,
  onChange,
  onAdd,
  onRemove,
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-medium">Collaterals</h3>
          <p className="text-sm text-muted-foreground">
            At least one collateral is required.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          Add collateral
        </Button>
      </div>

      {values.map((row, index) => (
        <CollateralRow
          key={index}
          value={row}
          index={index}
          onChange={(field, value) => onChange(index, field, value)}
          onRemove={() => onRemove(index)}
          canRemove={values.length > 1}
        />
      ))}
    </div>
  );
}
