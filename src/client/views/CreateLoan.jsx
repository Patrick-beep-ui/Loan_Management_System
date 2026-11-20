import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/client/contexts/AuthContext";
import { buildLoanSchedule } from "@/client/utils/loanSchedule";
import api from "@/lib/axiosService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const EMPTY_GUARANTOR = {
  mode: "existing",
  stakeholder_id: "",
  first_name: "",
  last_name: "",
  national_id: "",
  marital_status: "",
  occupation: "",
  date_of_birth: "",
};

const EMPTY_COLLATERAL = {
  description: "",
  estimated_value: "",
};

function Field({ id, label, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

function stakeholderName(stakeholder) {
  if (!stakeholder) return "—";

  const name = [stakeholder.first_name, stakeholder.last_name]
    .filter(Boolean)
    .join(" ");

  return name || `Stakeholder #${stakeholder.stakeholder_id}`;
}

function formatMoney(value) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parsePositiveInteger(value, label) {
  const text = String(value).trim();

  if (!/^\d+$/.test(text)) {
    throw new Error(`${label} must be a positive integer.`);
  }

  const number = Number(text);
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return number;
}

function parseMoney(value, label, allowZero = false) {
  const number = Number(value);
  const invalid = allowZero ? number < 0 : number <= 0;

  if (!Number.isFinite(number) || invalid || number > 9999999999.99) {
    throw new Error(`${label} is invalid.`);
  }

  const cents = Math.round(number * 100);
  if (Math.abs(number * 100 - cents) > 1e-6) {
    throw new Error(`${label} allows at most 2 decimal places.`);
  }

  return cents / 100;
}

function parseDateOnly(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must be a valid date.`);
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`${label} must be a valid date.`);
  }

  return value;
}

export default function CreateLoan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.Role?.role_name === "admin";

  const [form, setForm] = useState({
    customer_id: "",
    lender_id: "",
    loan_amount: "",
    interest_rate: "",
    interest_payment_mode: "included",
    disbursed_at: "",
    installment_count: "12",
    first_due_date: "",
  });
  const [guarantors, setGuarantors] = useState([{ ...EMPTY_GUARANTOR }]);
  const [collaterals, setCollaterals] = useState([{ ...EMPTY_COLLATERAL }]);
  const [stakeholders, setStakeholders] = useState([]);
  const [loadingStakeholders, setLoadingStakeholders] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchStakeholders() {
      try {
        const { data } = await api.get("/stakeholders");
        if (active) setStakeholders(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.error ||
              "Unable to load stakeholders. Please try again.",
          );
        }
      } finally {
        if (active) setLoadingStakeholders(false);
      }
    }

    fetchStakeholders();
    return () => {
      active = false;
    };
  }, []);

  function invalidatePreview() {
    setPreview(null);
    setError("");
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    invalidatePreview();
  }

  function updateGuarantor(index, field, value) {
    setGuarantors((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
    invalidatePreview();
  }

  function addGuarantor() {
    setGuarantors((current) => [...current, { ...EMPTY_GUARANTOR }]);
    invalidatePreview();
  }

  function removeGuarantor(index) {
    setGuarantors((current) => current.filter((_, rowIndex) => rowIndex !== index));
    invalidatePreview();
  }

  function updateCollateral(index, field, value) {
    setCollaterals((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
    invalidatePreview();
  }

  function addCollateral() {
    setCollaterals((current) => [...current, { ...EMPTY_COLLATERAL }]);
    invalidatePreview();
  }

  function removeCollateral(index) {
    setCollaterals((current) =>
      current.filter((_, rowIndex) => rowIndex !== index),
    );
    invalidatePreview();
  }

  function buildPayload() {
    const lenderId = isAdmin
      ? parsePositiveInteger(form.lender_id, "Lender")
      : Number(user?.stakeholder_id);

    if (!Number.isSafeInteger(lenderId) || lenderId <= 0) {
      throw new Error("Lender account is not linked to a stakeholder.");
    }

    const customerId = parsePositiveInteger(form.customer_id, "Customer");
    if (lenderId === customerId) {
      throw new Error("Lender and customer must be different.");
    }

    const loanAmount = parseMoney(form.loan_amount, "Loan amount");
    const rateText = form.interest_rate.trim();
    let interestRate = null;

    if (rateText !== "") {
      interestRate = Number(rateText);

      if (
        !Number.isFinite(interestRate) ||
        interestRate < 0 ||
        interestRate > 999.9999
      ) {
        throw new Error("Interest rate must be between 0 and 999.9999.");
      }

      const rateUnits = Math.round(interestRate * 10000);
      if (Math.abs(interestRate * 10000 - rateUnits) > 1e-6) {
        throw new Error("Interest rate allows at most 4 decimal places.");
      }

      interestRate = rateUnits / 10000;
    }

    if (
      form.interest_payment_mode === "separate" &&
      !(interestRate > 0)
    ) {
      throw new Error(
        "Interest rate must be greater than 0 when interest is separate.",
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(form.disbursed_at)) {
      throw new Error("Enter a valid disbursement date and time.");
    }

    parseDateOnly(form.disbursed_at.slice(0, 10), "Disbursement date");

    const installmentCount = parsePositiveInteger(
      form.installment_count,
      "Installment count",
    );
    if (installmentCount > 360) {
      throw new Error("Installment count must be between 1 and 360.");
    }

    const firstDueDate = parseDateOnly(form.first_due_date, "First due date");
    if (firstDueDate < form.disbursed_at.slice(0, 10)) {
      throw new Error("First due date cannot be before disbursement date.");
    }

    if (guarantors.length === 0) {
      throw new Error("Add at least one guarantor.");
    }

    const normalizedGuarantors = guarantors.map((row, index) => {
      if (row.mode === "existing") {
        return {
          stakeholder_id: parsePositiveInteger(
            row.stakeholder_id,
            `Guarantor ${index + 1}`,
          ),
        };
      }

      const firstName = row.first_name.trim();
      const lastName = row.last_name.trim();
      const nationalId = row.national_id.trim();
      const occupation = row.occupation.trim();

      if (!firstName || !lastName) {
        throw new Error(
          `Guarantor ${index + 1} requires first and last name.`,
        );
      }

      if (
        row.marital_status &&
        !["single", "married"].includes(row.marital_status)
      ) {
        throw new Error(`Guarantor ${index + 1} has an invalid marital status.`);
      }

      if (row.date_of_birth) {
        parseDateOnly(
          row.date_of_birth,
          `Guarantor ${index + 1} date of birth`,
        );
      }

      return {
        first_name: firstName,
        last_name: lastName,
        ...(nationalId ? { national_id: nationalId } : {}),
        ...(row.marital_status
          ? { marital_status: row.marital_status }
          : {}),
        ...(occupation ? { occupation } : {}),
        ...(row.date_of_birth ? { date_of_birth: row.date_of_birth } : {}),
      };
    });

    if (collaterals.length === 0) {
      throw new Error("Add at least one collateral.");
    }

    const normalizedCollaterals = collaterals.map((row, index) => {
      const description = row.description.trim();
      if (!description) {
        throw new Error(`Collateral ${index + 1} requires a description.`);
      }

      return {
        description,
        ...(row.estimated_value.trim() !== ""
          ? {
              estimated_value: parseMoney(
                row.estimated_value,
                `Collateral ${index + 1} estimated value`,
                true,
              ),
            }
          : {}),
      };
    });

    const schedule = buildLoanSchedule({
      loanAmount,
      interestRate,
      interestPaymentMode: form.interest_payment_mode,
      installmentCount,
      firstDueDate,
    });

    return {
      schedule,
      payload: {
        lender_id: lenderId,
        customer_id: customerId,
        loan_amount: loanAmount,
        interest_rate: interestRate,
        interest_payment_mode: form.interest_payment_mode,
        disbursed_at: form.disbursed_at,
        installments: schedule.installments,
        guarantors: normalizedGuarantors,
        collaterals: normalizedCollaterals,
      },
    };
  }

  function handlePreview(event) {
    event.preventDefault();
    setError("");

    try {
      const { schedule } = buildPayload();
      setPreview(schedule);
    } catch (validationError) {
      setPreview(null);
      setError(validationError.message || "Check the form and try again.");
    }
  }

  async function handleApprove() {
    setError("");

    let payload;
    try {
      ({ payload } = buildPayload());
    } catch (validationError) {
      setPreview(null);
      setError(validationError.message || "Check the form and try again.");
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post("/loans", payload);
      navigate("/loans", {
        replace: true,
        state: { createdLoanId: data.loan_id },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Unable to create the loan. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const lenderId = isAdmin ? form.lender_id : user?.stakeholder_id;
  const customerOptions = stakeholders.filter(
    (stakeholder) => String(stakeholder.stakeholder_id) !== String(lenderId),
  );
  const stakeholderPlaceholder = loadingStakeholders
    ? "Loading stakeholders..."
    : stakeholders.length === 0
      ? "No stakeholders found"
      : "Select a stakeholder";

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create loan</CardTitle>
          <CardDescription>
            Complete the loan details, review the generated installments, then
            approve the creation.
          </CardDescription>
        </CardHeader>

        {!preview ? (
          <form onSubmit={handlePreview}>
            <CardContent className="space-y-6">
              <ErrorAlert message={error} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="lender" label="Lender">
                  {isAdmin ? (
                    <Select
                      value={form.lender_id}
                      onValueChange={(value) => updateForm("lender_id", value)}
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
                </Field>

                <Field id="customer_id" label="Customer">
                  <Select
                    value={form.customer_id}
                    onValueChange={(value) => updateForm("customer_id", value)}
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
                </Field>

                <Field id="loan_amount" label="Loan amount">
                  <Input
                    id="loan_amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="10000.00"
                    value={form.loan_amount}
                    onChange={(event) =>
                      updateForm("loan_amount", event.target.value)
                    }
                    required
                  />
                </Field>

                <Field id="interest_rate" label="Interest rate (%)">
                  <Input
                    id="interest_rate"
                    type="number"
                    min="0"
                    max="999.9999"
                    step="0.0001"
                    inputMode="decimal"
                    placeholder="12"
                    value={form.interest_rate}
                    onChange={(event) =>
                      updateForm("interest_rate", event.target.value)
                    }
                  />
                </Field>

                <Field id="interest_payment_mode" label="Interest mode">
                  <Select
                    value={form.interest_payment_mode}
                    onValueChange={(value) =>
                      updateForm("interest_payment_mode", value)
                    }
                  >
                    <SelectTrigger id="interest_payment_mode" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="included">Included in installments</SelectItem>
                      <SelectItem value="separate">Billed separately</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field id="disbursed_at" label="Disbursed at">
                  <Input
                    id="disbursed_at"
                    type="datetime-local"
                    value={form.disbursed_at}
                    onChange={(event) =>
                      updateForm("disbursed_at", event.target.value)
                    }
                    required
                  />
                </Field>

                <Field id="installment_count" label="Number of installments">
                  <Input
                    id="installment_count"
                    type="number"
                    min="1"
                    max="360"
                    step="1"
                    inputMode="numeric"
                    value={form.installment_count}
                    onChange={(event) =>
                      updateForm("installment_count", event.target.value)
                    }
                    required
                  />
                </Field>

                <Field id="first_due_date" label="First due date">
                  <Input
                    id="first_due_date"
                    type="date"
                    min={form.disbursed_at.slice(0, 10) || undefined}
                    value={form.first_due_date}
                    onChange={(event) =>
                      updateForm("first_due_date", event.target.value)
                    }
                    required
                  />
                </Field>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium">Guarantors</h3>
                    <p className="text-sm text-muted-foreground">
                      At least one guarantor is required.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addGuarantor}>
                    Add guarantor
                  </Button>
                </div>

                {guarantors.map((row, index) => (
                  <div
                    key={index}
                    className="space-y-4 rounded-lg bg-muted/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Guarantor {index + 1}</p>
                      {guarantors.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuarantor(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <Field
                      id={`guarantor-mode-${index}`}
                      label="Guarantor type"
                    >
                      <Select
                        value={row.mode}
                        onValueChange={(value) =>
                          updateGuarantor(index, "mode", value)
                        }
                      >
                        <SelectTrigger
                          id={`guarantor-mode-${index}`}
                          className="w-full"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="existing">Existing stakeholder</SelectItem>
                          <SelectItem value="inline">New stakeholder</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    {row.mode === "existing" ? (
                      <Field
                        id={`guarantor-stakeholder-${index}`}
                        label="Existing stakeholder"
                      >
                        <Select
                          value={row.stakeholder_id}
                          onValueChange={(value) =>
                            updateGuarantor(index, "stakeholder_id", value)
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
                      </Field>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          id={`guarantor-first-${index}`}
                          label="First name"
                        >
                          <Input
                            id={`guarantor-first-${index}`}
                            value={row.first_name}
                            onChange={(event) =>
                              updateGuarantor(
                                index,
                                "first_name",
                                event.target.value,
                              )
                            }
                            required
                          />
                        </Field>
                        <Field id={`guarantor-last-${index}`} label="Last name">
                          <Input
                            id={`guarantor-last-${index}`}
                            value={row.last_name}
                            onChange={(event) =>
                              updateGuarantor(
                                index,
                                "last_name",
                                event.target.value,
                              )
                            }
                            required
                          />
                        </Field>
                        <Field id={`guarantor-national-${index}`} label="National ID">
                          <Input
                            id={`guarantor-national-${index}`}
                            value={row.national_id}
                            onChange={(event) =>
                              updateGuarantor(
                                index,
                                "national_id",
                                event.target.value,
                              )
                            }
                          />
                        </Field>
                        <Field
                          id={`guarantor-marital-${index}`}
                          label="Marital status"
                        >
                          <Select
                            value={row.marital_status || "none"}
                            onValueChange={(value) =>
                              updateGuarantor(
                                index,
                                "marital_status",
                                value === "none" ? "" : value,
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
                        </Field>
                        <Field
                          id={`guarantor-occupation-${index}`}
                          label="Occupation"
                        >
                          <Input
                            id={`guarantor-occupation-${index}`}
                            value={row.occupation}
                            onChange={(event) =>
                              updateGuarantor(
                                index,
                                "occupation",
                                event.target.value,
                              )
                            }
                          />
                        </Field>
                        <Field
                          id={`guarantor-birth-${index}`}
                          label="Date of birth"
                        >
                          <Input
                            id={`guarantor-birth-${index}`}
                            type="date"
                            value={row.date_of_birth}
                            onChange={(event) =>
                              updateGuarantor(
                                index,
                                "date_of_birth",
                                event.target.value,
                              )
                            }
                          />
                        </Field>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium">Collaterals</h3>
                    <p className="text-sm text-muted-foreground">
                      At least one collateral is required.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCollateral}
                  >
                    Add collateral
                  </Button>
                </div>

                {collaterals.map((row, index) => (
                  <div
                    key={index}
                    className="space-y-4 rounded-lg bg-muted/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Collateral {index + 1}</p>
                      {collaterals.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCollateral(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <Field
                      id={`collateral-description-${index}`}
                      label="Description"
                    >
                      <Textarea
                        id={`collateral-description-${index}`}
                        value={row.description}
                        onChange={(event) =>
                          updateCollateral(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        required
                      />
                    </Field>

                    <Field
                      id={`collateral-value-${index}`}
                      label="Estimated value (optional)"
                    >
                      <Input
                        id={`collateral-value-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={row.estimated_value}
                        onChange={(event) =>
                          updateCollateral(
                            index,
                            "estimated_value",
                            event.target.value,
                          )
                        }
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full">
                Preview installments
              </Button>
            </CardFooter>
          </form>
        ) : (
          <>
            <CardContent className="space-y-6">
              <ErrorAlert message={error} />

              <div className="grid gap-3 rounded-lg border border-border bg-muted/50 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Principal</p>
                  <p className="font-medium tabular-nums">
                    {formatMoney(preview.summary.principalCents / 100)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {form.interest_payment_mode === "included"
                      ? "Interest included"
                      : "Interest billed separately"}
                  </p>
                  <p className="font-medium tabular-nums">
                    {formatMoney(preview.summary.interestCents / 100)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {form.interest_payment_mode === "included"
                      ? "Schedule total"
                      : "Schedule total (principal)"}
                  </p>
                  <p className="font-medium tabular-nums">
                    {formatMoney(preview.summary.scheduleCents / 100)}
                  </p>
                </div>
              </div>

              <Table>
                <TableCaption>Installments generated before approval</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead className="text-right">Amount due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.installments.map((installment) => (
                    <TableRow key={installment.installment_number}>
                      <TableCell>{installment.installment_number}</TableCell>
                      <TableCell>{installment.due_date}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(installment.amount_due)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {form.interest_payment_mode === "separate" && (
                <p className="text-sm text-muted-foreground">
                  A pending interest obligation of{" "}
                  {formatMoney(preview.summary.interestCents / 100)} will be
                  created separately from these installments.
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreview(null)}
                disabled={submitting}
              >
                Back to edit
              </Button>
              <Button type="button" onClick={handleApprove} disabled={submitting}>
                {submitting ? "Creating loan..." : "Approve & create"}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </main>
  );
}
