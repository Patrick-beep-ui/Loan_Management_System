import { useState } from "react";

import { buildPaymentPayload } from "@/client/utils/loanPayment";
import api from "@/lib/axiosService";

export function useLoanPayment({ loanId, onPaid }) {
  const [target, setTarget] = useState(null);
  const [paidAt, setPaidAt] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  function resetForm() {
    setTarget(null);
    setPaidAt("");
    setError("");
  }

  function openInstallment(installment) {
    setSuccess("");
    setPaidAt("");
    setError("");
    setTarget({
      kind: "installment",
      label: `Installment #${installment.installment_number}`,
      amount: installment.amount_due,
      dueDate: installment.due_date,
      installmentId: installment.installment_id,
    });
  }

  function openInterest(loan) {
    setSuccess("");
    setPaidAt("");
    setError("");
    setTarget({
      kind: "interest",
      label: "Ordinary interest",
      amount: loan.interest_amount,
      interestPaymentId: loan.interestPayment?.loan_interest_payment_id,
    });
  }

  function close() {
    if (submitting) return;
    resetForm();
  }

  function dismissSuccess() {
    setSuccess("");
  }

  async function refresh() {
    try {
      await onPaid();
    } catch {
      setError("Payment recorded, but the loan could not be refreshed.");
    }
  }

  async function confirmPayment() {
    if (!target) return;

    setError("");

    let payload;
    try {
      payload = buildPaymentPayload({ loanId, target, paidAt });
    } catch (validationError) {
      setError(validationError.message || "Check the payment date and try again.");
      return;
    }

    const endpoint =
      target.kind === "installment"
        ? "/payments/installment"
        : "/payments/interest";
    const label = target.label;

    setSubmitting(true);

    try {
      await api.post(endpoint, payload);
      resetForm();
      setSuccess(`${label} payment recorded.`);
      await refresh();
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setError(
          requestError.response?.data?.error ||
            "Unable to record the payment. Please try again.",
        );
      }

      if (requestError.response?.status === 409) {
        await refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return {
    target,
    paidAt,
    error,
    submitting,
    success,
    isInstallmentOpen: target?.kind === "installment",
    isInterestOpen: target?.kind === "interest",
    setPaidAt,
    openInstallment,
    openInterest,
    close,
    dismissSuccess,
    confirmPayment,
  };
}
