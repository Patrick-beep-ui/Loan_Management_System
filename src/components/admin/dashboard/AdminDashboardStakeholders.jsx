import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
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

export default function AdminDashboardStakeholders({ stakeholders }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stakeholders</CardTitle>
        <CardDescription>
          People linked to loans as lenders, customers, or guarantors.
        </CardDescription>
        <CardAction>
          <Link
            to="/admin/stakeholders"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Manage stakeholders
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Loan roles</TableHead>
                <TableHead className="text-right">Associated loans</TableHead>
                <TableHead className="text-right">Total scheduled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakeholders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No stakeholders found.
                  </TableCell>
                </TableRow>
              )}
              {stakeholders.map((stakeholder) => (
                <TableRow key={stakeholder.stakeholderId}>
                  <TableCell>
                    <Link
                      to={`/admin/stakeholders/${stakeholder.stakeholderId}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {stakeholder.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {Object.entries(stakeholder.roleCounts)
                      .filter(([, count]) => count > 0)
                      .map(([role]) => STAKEHOLDER_ROLE_LABELS[role])
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {stakeholder.loanCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(stakeholder.totalToPay)}
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
