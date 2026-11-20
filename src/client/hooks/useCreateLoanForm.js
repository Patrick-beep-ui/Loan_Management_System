import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/client/contexts/AuthContext";
import {
  buildLoanPayload,
  EMPTY_COLLATERAL,
  EMPTY_GUARANTOR,
} from "@/client/utils/loanForm";
import api from "@/lib/axiosService";

export function useCreateLoanForm() {
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
    setGuarantors((current) =>
      current.filter((_, rowIndex) => rowIndex !== index),
    );
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

  function buildCurrentPayload() {
    return buildLoanPayload({
      form,
      guarantors,
      collaterals,
      isAdmin,
      stakeholderId: user?.stakeholder_id,
    });
  }

  function handlePreview(event) {
    event.preventDefault();
    setError("");

    try {
      const { schedule } = buildCurrentPayload();
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
      ({ payload } = buildCurrentPayload());
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

  function backToEdit() {
    setPreview(null);
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

  return {
    form,
    guarantors,
    collaterals,
    stakeholders,
    loadingStakeholders,
    error,
    preview,
    submitting,
    isAdmin,
    user,
    lenderId,
    customerOptions,
    stakeholderPlaceholder,
    updateForm,
    updateGuarantor,
    addGuarantor,
    removeGuarantor,
    updateCollateral,
    addCollateral,
    removeCollateral,
    handlePreview,
    handleApprove,
    backToEdit,
  };
}
