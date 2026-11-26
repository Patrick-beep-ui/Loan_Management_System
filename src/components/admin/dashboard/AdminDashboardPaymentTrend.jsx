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

export default function AdminDashboardPaymentTrend({ payments }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment trend</CardTitle>
        <CardDescription>
          Recorded payments grouped by month, newest last.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Payments</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>No payments recorded.</TableCell>
                </TableRow>
              )}
              {payments.map((entry) => (
                <TableRow key={entry.key}>
                  <TableCell>{entry.label}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {entry.count}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(entry.amount)}
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
