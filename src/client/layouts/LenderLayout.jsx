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
    <>
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-6">
            <span className="whitespace-nowrap font-heading text-lg text-foreground">
              Loan Management
            </span>
            <nav aria-label="Main sections" className="flex gap-4">
              {links.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                      "focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      isActive && "text-foreground underline underline-offset-4",
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <LogoutButton className="shrink-0 text-muted-foreground hover:text-foreground" />
        </div>
      </header>
      <Outlet />
    </>
  );
}
