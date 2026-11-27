import { NavLink, Outlet } from "react-router-dom";
import { cn } from "cn";

import LogoutButton from "@/components/auth/LogoutButton";

const links = [
  { to: "/loans", label: "Loans" },
  { to: "/payments", label: "Payments" },
  { to: "/stakeholders", label: "Stakeholders" },
];

export default function LenderLayout() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-6 font-heading text-3xl text-foreground">
          Loan Management System
        </h1>
        <nav aria-label="Lender sections" className="mb-8 border-b border-border">
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
            <LogoutButton className="shrink-0 text-muted-foreground hover:text-foreground" />
          </div>
        </nav>
        <Outlet />
      </div>
    </main>
  );
}
