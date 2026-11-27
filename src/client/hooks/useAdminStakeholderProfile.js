import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { buildStakeholderProfile } from "@/client/utils/stakeholderProfile";
import api from "@/lib/axiosService";

export function useAdminStakeholderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stakeholder, setStakeholder] = useState(null);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotFound(false);

    try {
      const [stakeholderResponse, loansResponse, usersResponse] =
        await Promise.all([
          api.get(`/stakeholders/${id}`),
          api.get("/loans"),
          api.get("/users"),
        ]);

      setStakeholder(stakeholderResponse.data);
      setLoans(Array.isArray(loansResponse.data) ? loansResponse.data : []);
      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status !== 401) {
        const isMissing = status === 404;
        setNotFound(isMissing);
        setError(
          isMissing
            ? ""
            : requestError.response?.data?.error ||
              "Unable to load the stakeholder profile. Please try again.",
        );
      }
      setStakeholder(null);
      setLoans([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const profile = useMemo(
    () =>
      stakeholder
        ? buildStakeholderProfile({ stakeholder, loans, users })
        : null,
    [stakeholder, loans, users],
  );

  function goBack() {
    navigate("/admin/stakeholders");
  }

  return {
    id,
    profile,
    loading,
    error,
    notFound,
    refresh: fetchProfile,
    goBack,
  };
}
