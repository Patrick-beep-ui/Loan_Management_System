import { Link } from "react-router-dom";

import { TableCell, TableRow } from "@/components/ui/table";
import { STAKEHOLDER_ROLE_LABELS } from "@/client/utils/stakeholderProfile";

function RoleBadges({ roles }) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <span
          key={role}
          className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
        >
          {STAKEHOLDER_ROLE_LABELS[role]}
        </span>
      ))}
    </div>
  );
}

function LoanLinks({ loanIds }) {
  return (
    <div className="flex flex-wrap gap-1">
      {loanIds.map((loanId) => (
        <Link
          key={loanId}
          to={`/loans/${loanId}`}
          className="text-foreground underline-offset-4 hover:underline"
        >
          #{loanId}
        </Link>
      ))}
    </div>
  );
}

export default function StakeholderRow({ row }) {
  return (
    <TableRow>
      <TableCell>{row.stakeholderId}</TableCell>
      <TableCell className="font-medium">{row.name}</TableCell>
      <TableCell>{row.nationalId}</TableCell>
      <TableCell>{row.occupation}</TableCell>
      <TableCell>
        <RoleBadges roles={row.roles} />
      </TableCell>
      <TableCell>
        <LoanLinks loanIds={row.loanIds} />
        <span className="mt-1 block text-xs text-muted-foreground">
          {row.loanCount} loan{row.loanCount === 1 ? "" : "s"}
        </span>
      </TableCell>
    </TableRow>
  );
}
