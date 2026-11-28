import { useCallback, useEffect, useMemo, useState } from "react";

import { buildAdminDashboardData } from "@/client/utils/adminDashboard";
import api from "@/lib/axiosService";

export function useAdminDashboard() {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [loansResponse, paymentsResponse] = await Promise.all([
        api.get("/loans"),
        api.get("/payments"),
      ]);

      setLoans(Array.isArray(loansResponse.data) ? loansResponse.data : []);
      setPayments(
        Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [],
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dashboard = useMemo(
    () => buildAdminDashboardData({ loans, payments }),
    [loans, payments],
  );

  return { ...dashboard, loading, error, refresh };
}
