import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount, formatDate } from "@/client/utils/loanFormat";
import { findInstallmentPayment } from "@/client/utils/paymentHistory";

export default function LoanInstallmentsTable({
  installments,
  payments = [],
  onPay,
  onRevert,
  paymentDisabled,
}) {
  const rows = Array.isArray(installments)
    ? [...installments].sort(
        (left, right) =>
          Number(left.installment_number) - Number(right.installment_number),
      )
    : [];

  return (
    <section className="space-y-3">
      <h3 className="font-medium">Installments</h3>
      <Table>
        <TableCaption>Loan payment schedule</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead className="text-right">Amount due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No installments found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((installment) => {
              const isPaid =
                String(installment.status).toLowerCase() === "paid";
              const recordedPayment = findInstallmentPayment(
                payments,
                installment.installment_id,
              );

              return (
                <TableRow
                  key={
                    installment.installment_id ?? installment.installment_number
                  }
                >
                  <TableCell>{installment.installment_number}</TableCell>
                  <TableCell>{formatDate(installment.due_date)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(installment.amount_due)}
                  </TableCell>
                  <TableCell>{installment.status || "—"}</TableCell>
                  <TableCell className="text-right">
                    {isPaid ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => onRevert(recordedPayment, installment)}
                        disabled={!recordedPayment || paymentDisabled}
                      >
                        Revert
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onPay(installment)}
                        disabled={paymentDisabled}
                      >
                        Pay
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </section>
  );
}
