import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useLoanFormState } from "@/client/hooks/useLoanFormState";
import {
  buildRestrictedLoanPatchPayload,
  loanHasPayments,
  loanToFormState,
} from "@/client/utils/loanEdit";
import api from "@/lib/axiosService";

export function useEditLoanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const formState = useLoanFormState();
  const [loadingLoan, setLoadingLoan] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [hasPayments, setHasPayments] = useState(false);

  const fetchLoan = useCallback(async () => {
    setLoadingLoan(true);
    setLoadError("");
    setNotFound(false);

    try {
      const { data } = await api.get(`/loans/${id}`);
      formState.applyInitialState(loanToFormState(data));
      setHasPayments(loanHasPayments(data));
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

    let payload;
    try {
      payload = hasPayments
        ? buildRestrictedLoanPatchPayload({
            form: formState.form,
            guarantors: formState.guarantors,
            collaterals: formState.collaterals,
            isAdmin: formState.isAdmin,
          })
        : formState.buildCurrentPayload().payload;
    } catch (validationError) {
      formState.clearPreview();
      formState.setFormError(
        validationError.message || "Check the form and try again.",
      );
      return;
    }

    formState.setSubmitting(true);

    try {
      if (hasPayments) {
        await api.patch(`/loans/${id}`, payload);
      } else {
        await api.put(`/loans/${id}`, payload);
      }

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
    hasPayments,
    fetchLoan,
    handleApprove,
  };
}
