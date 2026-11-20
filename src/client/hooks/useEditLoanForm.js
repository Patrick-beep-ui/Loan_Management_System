import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useLoanFormState } from "@/client/hooks/useLoanFormState";
import { loanHasPayments, loanToFormState } from "@/client/utils/loanEdit";
import api from "@/lib/axiosService";

export function useEditLoanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const formState = useLoanFormState();
  const [loadingLoan, setLoadingLoan] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [locked, setLocked] = useState(false);

  const fetchLoan = useCallback(async () => {
    setLoadingLoan(true);
    setLoadError("");
    setNotFound(false);

    try {
      const { data } = await api.get(`/loans/${id}`);
      formState.applyInitialState(loanToFormState(data));
      setLocked(loanHasPayments(data));
    } catch (requestError) {
      setNotFound(requestError.response?.status === 404);
      setLoadError(
        requestError.response?.data?.error ||
          "Unable to load the loan. Please try again.",
      );
    } finally {
      setLoadingLoan(false);
    }
  }, [formState.applyInitialState, id]);

  useEffect(() => {
    fetchLoan();
  }, [fetchLoan]);

  async function handleApprove() {
    formState.setFormError("");

    if (locked) {
      formState.setFormError(
        "This loan has recorded payments and can no longer be edited.",
      );
      return;
    }

    let payload;
    try {
      ({ payload } = formState.buildCurrentPayload());
    } catch (validationError) {
      formState.clearPreview();
      formState.setFormError(
        validationError.message || "Check the form and try again.",
      );
      return;
    }

    formState.setSubmitting(true);

    try {
      await api.put(`/loans/${id}`, payload);
      navigate(`/loans/${id}`, {
        replace: true,
        state: { updatedLoanId: Number(id) },
      });
    } catch (requestError) {
      formState.setFormError(
        requestError.response?.data?.error ||
          "Unable to update the loan. Please try again.",
      );
    } finally {
      formState.setSubmitting(false);
    }
  }

  return {
    ...formState,
    id,
    loadingLoan,
    loadError,
    notFound,
    locked,
    fetchLoan,
    handleApprove,
  };
}
