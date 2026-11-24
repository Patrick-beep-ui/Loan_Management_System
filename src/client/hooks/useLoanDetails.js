import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { loanHasPayments } from "@/client/utils/loanEdit";
import api from "@/lib/axiosService";

export function useLoanDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const updatedLoanId = location.state?.updatedLoanId;
  const [showUpdated, setShowUpdated] = useState(Boolean(updatedLoanId));
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchLoan = useCallback(async ({ initial = false } = {}) => {
    setError("");
    setNotFound(false);
    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const { data } = await api.get(`/loans/${id}`);
      setLoan(data);
    } catch (requestError) {
      const status = requestError.response?.status;
      setNotFound(status === 404);
      setError(
        requestError.response?.data?.error ||
          "Unable to load the loan. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLoan({ initial: true });
  }, [fetchLoan]);

  const refreshLoan = useCallback(() => fetchLoan(), [fetchLoan]);

  const locked = loanHasPayments(loan);

  function dismissUpdated() {
    setShowUpdated(false);
  }

  function goBack() {
    navigate("/loans");
  }

  function goToEdit() {
    if (!locked) navigate(`/loans/${id}/edit`);
  }

  function openDelete() {
    if (locked) return;
    setDeleteError("");
    setShowDelete(true);
  }

  function closeDelete() {
    setShowDelete(false);
  }

  async function confirmDelete() {
    setDeleteError("");
    setDeleting(true);

    try {
      await api.delete(`/loans/${id}`);
      navigate("/loans", {
        replace: true,
        state: { deletedLoanId: Number(id) },
      });
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setDeleteError(
          requestError.response?.data?.error ||
            "Unable to delete the loan. Please try again.",
        );
      }
    } finally {
      setDeleting(false);
    }
  }

  return {
    id,
    loan,
    loading,
    refreshing,
    error,
    notFound,
    locked,
    fetchLoan,
    refreshLoan,
    showUpdated,
    updatedLoanId,
    dismissUpdated,
    goBack,
    goToEdit,
    showDelete,
    deleteError,
    deleting,
    openDelete,
    closeDelete,
    confirmDelete,
  };
}
