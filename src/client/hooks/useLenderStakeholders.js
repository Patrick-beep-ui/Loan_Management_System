import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/client/contexts/AuthContext";
import { buildLenderStakeholders } from "@/client/utils/lenderStakeholders";
import api from "@/lib/axiosService";

export function useLenderStakeholders() {
  const { user } = useAuth();
  const [stakeholders, setStakeholders] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const [stakeholdersResponse, loansResponse] = await Promise.all([
        api.get("/stakeholders"),
        api.get("/loans"),
      ]);

      setStakeholders(
        Array.isArray(stakeholdersResponse.data) ? stakeholdersResponse.data : [],
      );
      setLoans(Array.isArray(loansResponse.data) ? loansResponse.data : []);
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setError(
          requestError.response?.data?.error ||
            "Unable to load stakeholders. Please try again.",
        );
      }
      setStakeholders([]);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const rows = useMemo(
    () =>
      buildLenderStakeholders({
        stakeholders,
        loans,
        ownStakeholderId: user?.stakeholder_id,
      }),
    [stakeholders, loans, user?.stakeholder_id],
  );

  return { rows, loading, error, refresh: fetchData };
}
