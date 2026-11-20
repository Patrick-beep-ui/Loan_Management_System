import { buildLoanSchedule } from "@/client/utils/loanSchedule";

export const EMPTY_GUARANTOR = {
  mode: "existing",
  stakeholder_id: "",
  first_name: "",
  last_name: "",
  national_id: "",
  marital_status: "",
  occupation: "",
  date_of_birth: "",
};

export const EMPTY_COLLATERAL = {
  description: "",
  estimated_value: "",
};

export function stakeholderName(stakeholder) {
  if (!stakeholder) return "—";

  const name = [stakeholder.first_name, stakeholder.last_name]
    .filter(Boolean)
    .join(" ");

  return name || `Stakeholder #${stakeholder.stakeholder_id}`;
}

export function formatMoney(value) {
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

export function buildLoanPayload({
  form,
  guarantors,
  collaterals,
  isAdmin,
  stakeholderId,
}) {
  const lenderId = isAdmin
    ? parsePositiveInteger(form.lender_id, "Lender")
    : Number(stakeholderId);

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

  if (form.interest_payment_mode === "separate" && !(interestRate > 0)) {
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
      throw new Error(`Guarantor ${index + 1} requires first and last name.`);
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
      ...(row.marital_status ? { marital_status: row.marital_status } : {}),
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
