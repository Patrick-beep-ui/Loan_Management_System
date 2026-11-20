import { useNavigate } from "react-router-dom";

import { useLoanFormState } from "@/client/hooks/useLoanFormState";
import api from "@/lib/axiosService";

export function useCreateLoanForm() {
  const navigate = useNavigate();
  const formState = useLoanFormState();

  async function handleApprove() {
    formState.setFormError("");

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
      const { data } = await api.post("/loans", payload);
      navigate("/loans", {
        replace: true,
        state: { createdLoanId: data.loan_id },
      });
    } catch (requestError) {
      formState.setFormError(
        requestError.response?.data?.error ||
          "Unable to create the loan. Please try again.",
      );
    } finally {
      formState.setSubmitting(false);
    }
  }

  return {
    ...formState,
    handleApprove,
  };
}
