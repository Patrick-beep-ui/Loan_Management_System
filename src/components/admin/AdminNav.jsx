import { NavLink } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/stakeholders", label: "Stakeholders" },
  { to: "/admin/loans", label: "Loans" },
  { to: "/admin/payments", label: "Payments" },
];

export default function AdminNav() {
  return (
    <nav aria-label="Admin sections" className="mb-8 flex flex-wrap gap-2">
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            buttonVariants({ variant: isActive ? "default" : "outline" })
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
