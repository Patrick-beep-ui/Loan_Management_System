import { useCallback, useEffect, useMemo, useState } from "react";

import { buildPaymentPayload } from "@/client/utils/loanPayment";
import { fullName } from "@/client/utils/loanFormat";
import { usePaymentRevert } from "@/client/hooks/usePaymentRevert";
import api from "@/lib/axiosService";

function buildTargetOptions(loan) {
  if (!loan) return [];

  const options = [];

  for (const installment of loan.installments || []) {
    if (String(installment.status).toLowerCase() === "paid") continue;

    options.push({
      key: `installment:${installment.installment_id}`,
      kind: "installment",
      label: `Installment #${installment.installment_number}`,
      amount: installment.amount_due,
      installmentId: installment.installment_id,
    });
  }

  const interest = loan.interestPayment;

  if (
    loan.interest_payment_mode === "separate" &&
    interest &&
    String(interest.status).toLowerCase() !== "paid" &&
    interest.payment_id == null
  ) {
    options.push({
      key: `interest:${loan.loan_id}`,
      kind: "interest",
      label: "Ordinary interest",
      amount: loan.interest_amount,
      interestPaymentId: interest.loan_interest_payment_id,
    });
  }

  return options;
}

function buildLoanOptions(loans) {
  return loans
    .map((loan) => ({
      value: String(loan.loan_id),
      label: `Loan #${loan.loan_id} · ${fullName(loan.customer)}`,
      targetCount: buildTargetOptions(loan).length,
    }))
    .filter((option) => option.targetCount > 0);
}

function paymentLabel(payment) {
  const installment = payment.InstallmentPayment?.LoanInstallment;
  return installment
    ? `Installment #${installment.installment_number}`
    : "Ordinary interest";
}

export function useAdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recordOpen, setRecordOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedTargetKey, setSelectedTargetKey] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [recordError, setRecordError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/payments");
      setPayments(Array.isArray(data) ? data : []);
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setError(
          requestError.response?.data?.error ||
            "Unable to load payments. Please try again.",
        );
      }
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLoans = useCallback(async () => {
    setLoadingLoans(true);

    try {
      const { data } = await api.get("/loans");
      setLoans(Array.isArray(data) ? data : []);
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setError(
          requestError.response?.data?.error ||
            "Unable to load loans. Please try again.",
        );
      }
      setLoans([]);
    } finally {
      setLoadingLoans(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setError("");
    await Promise.all([fetchPayments(), fetchLoans()]);
  }, [fetchPayments, fetchLoans]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const revert = usePaymentRevert({ onReverted: refresh });

  const loanOptions = useMemo(() => buildLoanOptions(loans), [loans]);
  const selectedLoan = loans.find(
    (loan) => String(loan.loan_id) === String(selectedLoanId),
  );
  const targetOptions = useMemo(
    () => buildTargetOptions(selectedLoan),
    [selectedLoan],
  );
  const selectedTarget = targetOptions.find(
    (target) => target.key === selectedTargetKey,
  );

  function dismissError() {
    setError("");
  }

  function dismissSuccess() {
    setSuccess("");
  }

  function openRecord() {
    setSuccess("");
    setRecordError("");
    setPaidAt("");
    setSelectedTargetKey("");
    setSelectedLoanId(loanOptions[0]?.value || "");
    revert.dismissSuccess();
    setRecordOpen(true);
  }

  function closeRecord() {
    if (!submitting) setRecordOpen(false);
  }

  function changeLoan(value) {
    setSelectedLoanId(value);
    setSelectedTargetKey("");
    setRecordError("");
  }

  function changeTarget(value) {
    setSelectedTargetKey(value);
    setRecordError("");
  }

  function changePaidAt(value) {
    setPaidAt(value);
    setRecordError("");
  }

  function buildRecordRequest() {
    if (!selectedLoanId) return { error: "Select a loan." };

    const loanId = Number(selectedLoanId);

    if (!Number.isInteger(loanId) || loanId <= 0) {
      return { error: "Select a valid loan." };
    }

    if (!selectedTarget) {
      return { error: "Select a pending installment or interest obligation." };
    }

    let payload;
    try {
      payload = buildPaymentPayload({ loanId, target: selectedTarget, paidAt });
    } catch (validationError) {
      return {
        error: validationError.message || "Check the payment date and try again.",
      };
    }

    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      return { error: "The selected payment target has no valid amount." };
    }

    return { payload, target: selectedTarget };
  }

  async function confirmRecord() {
    const request = buildRecordRequest();

    if (request.error) {
      setRecordError(request.error);
      return false;
    }

    setRecordError("");
    setSubmitting(true);

    try {
      const endpoint =
        request.target.kind === "installment"
          ? "/payments/installment"
          : "/payments/interest";

      await api.post(endpoint, request.payload);

      setRecordOpen(false);
      setSelectedLoanId("");
      setSelectedTargetKey("");
      setPaidAt("");
      await refresh();
      setSuccess(`${request.target.label} payment recorded.`);
      return true;
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setRecordError(
          requestError.response?.data?.error ||
            "Unable to record the payment. Please try again.",
        );
      }

      if (requestError.response?.status === 409) {
        await refresh();
      }

      return false;
    } finally {
      setSubmitting(false);
    }
  }

  function openRevert(payment) {
    setSuccess("");
    revert.dismissSuccess();
    revert.open({
      paymentId: payment.payment_id,
      label: paymentLabel(payment),
      amount: payment.amount,
      paidAt: payment.paid_at,
    });
  }

  return {
    payments,
    loans,
    loading,
    loadingLoans,
    error,
    success,
    dismissError,
    dismissSuccess,
    refresh,
    revert,
    openRevert,
    recordOpen,
    loanOptions,
    selectedLoanId,
    targetOptions,
    selectedTargetKey,
    selectedTarget,
    paidAt,
    recordError,
    submitting,
    openRecord,
    closeRecord,
    changeLoan,
    changeTarget,
    changePaidAt,
    confirmRecord,
  };
}
