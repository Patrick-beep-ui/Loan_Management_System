import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function Field({ id, label, error, children }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {error && (
                <p id={`${id}-error`} className="text-xs text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function StakeholderFormFields({
    values,
    fieldErrors = {},
    onChange,
    idPrefix = "stakeholder",
}) {
    const ids = {
        first_name: `${idPrefix}-first`,
        last_name: `${idPrefix}-last`,
        national_id: `${idPrefix}-national`,
        marital_status: `${idPrefix}-marital`,
        occupation: `${idPrefix}-occupation`,
        date_of_birth: `${idPrefix}-birth`,
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <Field
                id={ids.first_name}
                label="First name"
                error={fieldErrors.first_name}
            >
                <Input
                    id={ids.first_name}
                    value={values.first_name}
                    onChange={(event) =>
                        onChange("first_name", event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.first_name)}
                    aria-describedby={
                        fieldErrors.first_name
                            ? `${ids.first_name}-error`
                            : undefined
                    }
                    required
                />
            </Field>
            <Field
                id={ids.last_name}
                label="Last name"
                error={fieldErrors.last_name}
            >
                <Input
                    id={ids.last_name}
                    value={values.last_name}
                    onChange={(event) =>
                        onChange("last_name", event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.last_name)}
                    aria-describedby={
                        fieldErrors.last_name
                            ? `${ids.last_name}-error`
                            : undefined
                    }
                    required
                />
            </Field>
            <Field
                id={ids.national_id}
                label="National ID"
                error={fieldErrors.national_id}
            >
                <Input
                    id={ids.national_id}
                    value={values.national_id}
                    onChange={(event) =>
                        onChange("national_id", event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.national_id)}
                    aria-describedby={
                        fieldErrors.national_id
                            ? `${ids.national_id}-error`
                            : undefined
                    }
                />
            </Field>
            <Field
                id={ids.marital_status}
                label="Marital status"
                error={fieldErrors.marital_status}
            >
                <Select
                    value={values.marital_status || "none"}
                    onValueChange={(value) =>
                        onChange("marital_status", value === "none" ? "" : value)
                    }
                >
                    <SelectTrigger
                        id={ids.marital_status}
                        className="w-full"
                        aria-invalid={Boolean(fieldErrors.marital_status)}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Not specified</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field
                id={ids.occupation}
                label="Occupation"
                error={fieldErrors.occupation}
            >
                <Input
                    id={ids.occupation}
                    value={values.occupation}
                    onChange={(event) =>
                        onChange("occupation", event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.occupation)}
                    aria-describedby={
                        fieldErrors.occupation
                            ? `${ids.occupation}-error`
                            : undefined
                    }
                />
            </Field>
            <Field
                id={ids.date_of_birth}
                label="Date of birth"
                error={fieldErrors.date_of_birth}
            >
                <Input
                    id={ids.date_of_birth}
                    type="date"
                    value={values.date_of_birth}
                    onChange={(event) =>
                        onChange("date_of_birth", event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.date_of_birth)}
                    aria-describedby={
                        fieldErrors.date_of_birth
                            ? `${ids.date_of_birth}-error`
                            : undefined
                    }
                />
            </Field>
        </div>
    );
}
