export function toPaidAtIso(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Enter a valid payment date and time.");
  }

  return date.toISOString();
}

export function buildPaymentPayload({ loanId, target, paidAt }) {
  const paidAtIso = toPaidAtIso(paidAt);
  const payload = {
    loan_id: Number(loanId),
    amount: Number(target.amount),
    ...(paidAtIso ? { paid_at: paidAtIso } : {}),
  };

  if (target.kind === "installment") {
    return { ...payload, installment_id: Number(target.installmentId) };
  }

  return {
    ...payload,
    loan_interest_payment_id: Number(target.interestPaymentId),
  };
}
