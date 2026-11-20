import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/client/contexts/AuthContext";
import {
  buildLoanPayload,
  EMPTY_COLLATERAL,
  EMPTY_GUARANTOR,
  EMPTY_LOAN_FORM,
} from "@/client/utils/loanForm";
import api from "@/lib/axiosService";

export function useLoanFormState() {
  const { user } = useAuth();
  const isAdmin = user?.Role?.role_name === "admin";

  const [form, setForm] = useState({ ...EMPTY_LOAN_FORM });
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

  const setFormError = useCallback((message) => {
    setError(message);
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  const applyInitialState = useCallback((initial) => {
    if (!initial) return;

    setForm({ ...EMPTY_LOAN_FORM, ...(initial.form || {}) });
    setGuarantors(
      initial.guarantors?.length
        ? initial.guarantors.map((row) => ({ ...EMPTY_GUARANTOR, ...row }))
        : [{ ...EMPTY_GUARANTOR }],
    );
    setCollaterals(
      initial.collaterals?.length
        ? initial.collaterals.map((row) => ({ ...EMPTY_COLLATERAL, ...row }))
        : [{ ...EMPTY_COLLATERAL }],
    );
    setPreview(null);
    setError("");
  }, []);

  const invalidatePreview = useCallback(() => {
    setPreview(null);
    setError("");
  }, []);

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
    setSubmitting,
    setFormError,
    clearPreview,
    applyInitialState,
    updateForm,
    updateGuarantor,
    addGuarantor,
    removeGuarantor,
    updateCollateral,
    addCollateral,
    removeCollateral,
    buildCurrentPayload,
    handlePreview,
    backToEdit,
  };
}
