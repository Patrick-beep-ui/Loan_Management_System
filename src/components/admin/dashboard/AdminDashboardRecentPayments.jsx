import { Link } from "react-router-dom";

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

export default function AdminDashboardRecentPayments({ payments }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent payments</CardTitle>
        <CardDescription>The five most recent payment records.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Loan</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid on</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>No payments recorded.</TableCell>
                </TableRow>
              )}
              {payments.map((payment) => (
                <TableRow key={payment.payment_id}>
                  <TableCell className="font-medium">
                    {payment.payment_id}
                  </TableCell>
                  <TableCell>
                    {payment.loanId ? (
                      <Link
                        to={`/loans/${payment.loanId}`}
                        className="text-foreground underline-offset-4 hover:underline"
                      >
                        #{payment.loanId}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{payment.targetLabel}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatAmount(payment.amount)}
                  </TableCell>
                  <TableCell>{formatDate(payment.paid_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
