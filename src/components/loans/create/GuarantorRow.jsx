import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { stakeholderName } from "@/client/utils/loanForm";
import FormField from "@/components/loans/create/FormField";

export default function GuarantorRow({
  value,
  index,
  stakeholders,
  loadingStakeholders,
  stakeholderPlaceholder,
  onChange,
  onRemove,
  canRemove,
}) {
  return (
    <div className="space-y-4 rounded-lg bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Guarantor {index + 1}</p>
        {canRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>

      <FormField id={`guarantor-mode-${index}`} label="Guarantor type">
        <Select
          value={value.mode}
          onValueChange={(nextValue) => onChange("mode", nextValue)}
        >
          <SelectTrigger id={`guarantor-mode-${index}`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="existing">Existing stakeholder</SelectItem>
            <SelectItem value="inline">New stakeholder</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {value.mode === "existing" ? (
        <FormField
          id={`guarantor-stakeholder-${index}`}
          label="Existing stakeholder"
        >
          <Select
            value={value.stakeholder_id}
            onValueChange={(nextValue) =>
              onChange("stakeholder_id", nextValue)
            }
          >
            <SelectTrigger
              id={`guarantor-stakeholder-${index}`}
              className="w-full"
              disabled={loadingStakeholders}
            >
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
        </FormField>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id={`guarantor-first-${index}`} label="First name">
            <Input
              id={`guarantor-first-${index}`}
              value={value.first_name}
              onChange={(event) =>
                onChange("first_name", event.target.value)
              }
              required
            />
          </FormField>
          <FormField id={`guarantor-last-${index}`} label="Last name">
            <Input
              id={`guarantor-last-${index}`}
              value={value.last_name}
              onChange={(event) => onChange("last_name", event.target.value)}
              required
            />
          </FormField>
          <FormField id={`guarantor-national-${index}`} label="National ID">
            <Input
              id={`guarantor-national-${index}`}
              value={value.national_id}
              onChange={(event) =>
                onChange("national_id", event.target.value)
              }
            />
          </FormField>
          <FormField
            id={`guarantor-marital-${index}`}
            label="Marital status"
          >
            <Select
              value={value.marital_status || "none"}
              onValueChange={(nextValue) =>
                onChange(
                  "marital_status",
                  nextValue === "none" ? "" : nextValue,
                )
              }
            >
              <SelectTrigger
                id={`guarantor-marital-${index}`}
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not specified</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField id={`guarantor-occupation-${index}`} label="Occupation">
            <Input
              id={`guarantor-occupation-${index}`}
              value={value.occupation}
              onChange={(event) => onChange("occupation", event.target.value)}
            />
          </FormField>
          <FormField id={`guarantor-birth-${index}`} label="Date of birth">
            <Input
              id={`guarantor-birth-${index}`}
              type="date"
              value={value.date_of_birth}
              onChange={(event) =>
                onChange("date_of_birth", event.target.value)
              }
            />
          </FormField>
        </div>
      )}
    </div>
  );
}
