import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount } from "@/client/utils/loanFormat";
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

export default function AdminStakeholderLoansTable({ records }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Associated loans</CardTitle>
        <CardDescription>
          Every loan where this stakeholder is a lender, customer, or guarantor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Lender</TableHead>
                <TableHead className="text-right">Scheduled</TableHead>
                <TableHead className="text-right">Installments</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    No associated loans.
                  </TableCell>
                </TableRow>
              )}
              {records.map((record) => (
                <TableRow key={record.loanId}>
                  <TableCell className="font-medium">#{record.loanId}</TableCell>
                  <TableCell>
                    <RoleBadges roles={record.roles} />
                  </TableCell>
                  <TableCell>{record.customer}</TableCell>
                  <TableCell>{record.lender}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(record.totalToPay)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span>
                      {record.paidInstallmentCount}/{record.installmentCount}
                    </span>
                    {record.overdueInstallmentCount > 0 && (
                      <span className="block text-xs text-destructive">
                        {record.overdueInstallmentCount} overdue
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/loans/${record.loanId}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      View details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
