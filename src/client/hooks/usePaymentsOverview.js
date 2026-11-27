import { useCallback, useEffect, useState } from "react";

import api from "@/lib/axiosService";

export function usePaymentsOverview() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = useCallback(async () => {
    setError("");
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

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, error, refresh: fetchPayments };
}
