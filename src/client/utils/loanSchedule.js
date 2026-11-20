export function toCents(value) {
  const amount = Number(value);
  return Math.round(amount * 100);
}

export function calculateInterestCents(loanCents, interestRate) {
  const rate =
    interestRate === null || interestRate === undefined || interestRate === ""
      ? 0
      : Number(interestRate);

  return Math.round((loanCents * rate) / 100);
}

function parseDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function addMonthsClamped(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();

  target.setUTCDate(Math.min(day, lastDay));
  return target;
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

export function buildLoanSchedule({
  loanAmount,
  interestRate,
  interestPaymentMode,
  installmentCount,
  firstDueDate,
}) {
  const loanCents = toCents(loanAmount);
  const count = Number(installmentCount);

  if (!Number.isFinite(loanCents) || loanCents <= 0) {
    throw new Error("Loan amount must be greater than 0.");
  }

  if (!Number.isInteger(count) || count < 1 || count > 360) {
    throw new Error("Installment count must be between 1 and 360.");
  }

  const dueDate = parseDateOnly(firstDueDate);
  if (!dueDate) throw new Error("Enter a valid first due date.");

  const interestCents = calculateInterestCents(loanCents, interestRate);
  const scheduleCents =
    interestPaymentMode === "included"
      ? loanCents + interestCents
      : loanCents;

  const baseCents = Math.floor(scheduleCents / count);
  if (baseCents <= 0) {
    throw new Error(
      "Installment amount would be zero. Reduce the number of installments.",
    );
  }

  let usedCents = 0;
  const installments = Array.from({ length: count }, (_, index) => {
    const isLast = index === count - 1;
    const amountCents = isLast ? scheduleCents - usedCents : baseCents;
    usedCents += amountCents;

    return {
      installment_number: index + 1,
      amount_due: amountCents / 100,
      due_date: formatDateOnly(addMonthsClamped(dueDate, index)),
    };
  });

  return {
    installments,
    summary: {
      principalCents: loanCents,
      interestCents,
      scheduleCents,
      totalToPayCents: loanCents + interestCents,
    },
  };
}
