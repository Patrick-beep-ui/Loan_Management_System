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
import { formatAmount, formatDate } from "@/client/utils/loanFormat";

export default function AdminDashboardOverdue({ installments }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overdue installments</CardTitle>
        <CardDescription>
          Unpaid installments with a due date before today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Lender</TableHead>
                <TableHead>Installment</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead className="text-right">Amount due</TableHead>
                <TableHead className="text-right">Days overdue</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    No overdue installments.
                  </TableCell>
                </TableRow>
              )}
              {installments.map((installment) => (
                <TableRow
                  key={`${installment.loanId}-${
                    installment.installmentId ?? installment.installmentNumber
                  }`}
                >
                  <TableCell>
                    <Link
                      to={`/loans/${installment.loanId}`}
                      state={{ focusInstallmentId: installment.installmentId }}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      #{installment.loanId}
                    </Link>
                  </TableCell>
                  <TableCell>{installment.customer}</TableCell>
                  <TableCell>{installment.lender}</TableCell>
                  <TableCell>#{installment.installmentNumber}</TableCell>
                  <TableCell>{formatDate(installment.dueDate)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(installment.amountDue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {installment.daysOverdue}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/loans/${installment.loanId}`}
                      state={{ focusInstallmentId: installment.installmentId }}
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
