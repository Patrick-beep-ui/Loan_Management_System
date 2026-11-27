import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import api from "@/lib/axiosService";

const AuthContext = createContext(null);

export function AuthProvider() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      if (!localStorage.getItem("token")) {
        if (active) setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/users/auth");
        if (active) setUser(data);
      } catch {
        localStorage.removeItem("token");
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, []);

  async function login(token) {
    localStorage.setItem("token", token);

    try {
      const { data } = await api.get("/users/auth");
      setUser(data);
      return data;
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
      throw error;
    }
  }

  async function refreshUser() {
    const { data } = await api.get("/users/auth");
    setUser(data);
    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
      refreshUser,
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      <Outlet />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export function RequireAuth() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Checking session...
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  }

  if (user?.must_change_password && location.pathname !== "/change-password") {
    return (
      <Navigate
        to="/change-password"
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Checking session...
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  }

  if (user.Role?.role_name !== "admin") {
    return <Navigate to="/loans" replace />;
  }

  return <Outlet />;
}

export function RequireLender({ adminRedirect = "/admin/payments" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Checking session...
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  }

  if (user.Role?.role_name === "admin") {
    return <Navigate to={adminRedirect} replace />;
  }

  return <Outlet />;
}
