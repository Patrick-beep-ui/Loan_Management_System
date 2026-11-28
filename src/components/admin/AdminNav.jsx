import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "cn";

import { useAuth } from "@/client/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/stakeholders", label: "Stakeholders" },
  { to: "/admin/loans", label: "Loans" },
  { to: "/admin/payments", label: "Payments" },
];

export default function AdminNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav aria-label="Admin sections" className="mb-8 border-b border-border">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 gap-6 overflow-x-auto">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "relative -mb-px whitespace-nowrap border-b-2 border-transparent pb-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  "focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive && "border-primary text-foreground",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>
    </nav>
  );
}
