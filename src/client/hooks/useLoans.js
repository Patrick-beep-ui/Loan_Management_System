import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/client/contexts/AuthContext";
import { fullName } from "@/client/utils/loanFormat";
import api from "@/lib/axiosService";

export function useLoans() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const createdLoanId = location.state?.createdLoanId;
  const deletedLoanId = location.state?.deletedLoanId;
  const [showCreated, setShowCreated] = useState(Boolean(createdLoanId));
  const [showDeleted, setShowDeleted] = useState(Boolean(deletedLoanId));
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchLoans() {
    setError("");
    setLoading(true);

    try {
      const { data } = await api.get("/loans");
      setLoans(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Unable to load loans. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLoans();
  }, []);

  function dismissCreated() {
    setShowCreated(false);
  }

  function dismissDeleted() {
    setShowDeleted(false);
  }

  function goToCreateLoan() {
    navigate("/create-loan");
  }

  const stakeholderName = fullName(user?.Stakeholder);
  const roleName = user?.Role?.role_name;
  const description =
    stakeholderName !== "—"
      ? `Loans for ${stakeholderName}${roleName ? ` (${roleName})` : ""}.`
      : "All loans available to your account.";

  return {
    description,
    createdLoanId,
    showCreated,
    deletedLoanId,
    showDeleted,
    loans,
    loading,
    error,
    fetchLoans,
    dismissCreated,
    dismissDeleted,
    goToCreateLoan,
  };
}
