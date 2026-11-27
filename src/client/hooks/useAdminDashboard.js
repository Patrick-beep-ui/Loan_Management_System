import { useCallback, useEffect, useMemo, useState } from "react";

import { buildAdminDashboardData } from "@/client/utils/adminDashboard";
import api from "@/lib/axiosService";

export function useAdminDashboard() {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [loansResponse, paymentsResponse, stakeholdersResponse] =
        await Promise.all([
          api.get("/loans"),
          api.get("/payments"),
          api.get("/stakeholders"),
        ]);

      setLoans(Array.isArray(loansResponse.data) ? loansResponse.data : []);
      setPayments(
        Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [],
      );
      setStakeholders(
        Array.isArray(stakeholdersResponse.data) ? stakeholdersResponse.data : [],
      );
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setError(
          requestError.response?.data?.error ||
            "Unable to load dashboard metrics. Please try again.",
        );
      }
      setLoans([]);
      setPayments([]);
      setStakeholders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dashboard = useMemo(
    () => buildAdminDashboardData({ loans, payments, stakeholders }),
    [loans, payments, stakeholders],
  );

  return { ...dashboard, loading, error, refresh };
}
