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

export default function AdminDashboardStatus({ metrics }) {
  const rows = [
    {
      label: "Installments paid",
      value: `${metrics.paidInstallmentCount} / ${metrics.totalInstallments}`,
    },
    { label: "Installments pending", value: metrics.pendingInstallmentCount },
    { label: "Installments overdue", value: metrics.overdueInstallmentCount },
    { label: "Separate interest paid", value: metrics.separateInterestPaid },
    { label: "Separate interest pending", value: metrics.separateInterestPending },
    { label: "Loans with interest included", value: metrics.includedInterestLoans },
    { label: "Loans with separate interest", value: metrics.separateInterestLoans },
    { label: "Distinct lenders", value: metrics.lenderCount },
    { label: "Distinct customers", value: metrics.customerCount },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio status</CardTitle>
        <CardDescription>
          Installment and interest progress across all loans.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.value}
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
