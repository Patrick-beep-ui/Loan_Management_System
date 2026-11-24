import {
  EMPTY_COLLATERAL,
  EMPTY_GUARANTOR,
  EMPTY_LOAN_FORM,
  normalizeCollaterals,
  normalizeGuarantors,
  parsePositiveInteger,
} from "@/client/utils/loanForm";

function pad(value) {
  return String(value).padStart(2, "0");
}

export function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function loanToFormState(loan) {
  const installments = Array.isArray(loan?.installments)
    ? [...loan.installments].sort(
        (left, right) =>
          Number(left.installment_number) - Number(right.installment_number),
      )
    : [];
  const guarantors = Array.isArray(loan?.guarantors)
    ? loan.guarantors.map((item) => ({
        ...EMPTY_GUARANTOR,
        mode: "existing",
        stakeholder_id: String(
          item.guarantor?.stakeholder_id ?? item.guarantor_stakeholder_id ?? "",
        ),
      }))
    : [];
  const collaterals = Array.isArray(loan?.collaterals)
    ? loan.collaterals.map((item) => ({
        ...EMPTY_COLLATERAL,
        description: String(item.description ?? ""),
        estimated_value:
          item.estimated_value === null || item.estimated_value === undefined
            ? ""
            : String(item.estimated_value),
      }))
    : [];

  return {
    form: {
      ...EMPTY_LOAN_FORM,
      lender_id: String(loan?.lender_id ?? ""),
      customer_id: String(loan?.customer_id ?? ""),
      loan_amount: String(loan?.loan_amount ?? ""),
      interest_rate:
        loan?.interest_rate === null || loan?.interest_rate === undefined
          ? ""
          : String(loan.interest_rate),
      interest_payment_mode: loan?.interest_payment_mode || "included",
      disbursed_at: toDateTimeLocal(loan?.disbursed_at),
      installment_count: String(installments.length || 1),
      first_due_date: installments[0]?.due_date
        ? String(installments[0].due_date).slice(0, 10)
        : "",
    },
    guarantors: guarantors.length > 0 ? guarantors : [{ ...EMPTY_GUARANTOR }],
    collaterals: collaterals.length > 0 ? collaterals : [{ ...EMPTY_COLLATERAL }],
  };
}

export function loanHasPayments(loan) {
  const paidInstallment = (loan?.installments || []).some(
    (installment) => String(installment.status).toLowerCase() === "paid",
  );
  const paidInterest = String(loan?.interestPayment?.status).toLowerCase() === "paid";

  return paidInstallment || paidInterest;
}

export function interestPaymentRecord(loan) {
  const obligation = loan?.interestPayment;
  if (!obligation) return null;

  return obligation.LoanPayment ?? obligation.payment ?? null;
}

export function buildRestrictedLoanPatchPayload({
  form,
  guarantors,
  collaterals,
  isAdmin,
}) {
  const payload = {
    guarantors: normalizeGuarantors(guarantors),
    collaterals: normalizeCollaterals(collaterals),
  };

  if (isAdmin) {
    const lenderId = parsePositiveInteger(form.lender_id, "Lender");
    const customerId = parsePositiveInteger(form.customer_id, "Customer");

    if (lenderId === customerId) {
      throw new Error("Lender and customer must be different.");
    }

    payload.lender_id = lenderId;
  }

  return payload;
}
