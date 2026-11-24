import { useCallback, useEffect, useState } from "react";

import api from "@/lib/axiosService";

export function usePayments({ loanId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!loanId) {
      setPayments([]);
      return [];
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await api.get("/payments", {
        params: { loan_id: loanId },
      });
      const list = Array.isArray(data) ? data : [];
      setPayments(list);
      return list;
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setError(
          requestError.response?.data?.error ||
            "Unable to load payment history. Please try again.",
        );
      }
      setPayments([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { payments, loading, error, reload };
}
