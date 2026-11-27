import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PaymentRow from "@/components/payments/PaymentRow";
import { formatAmount } from "@/client/utils/loanFormat";

function sumPayments(payments) {
  return payments.reduce((total, payment) => {
    const amount = Number(payment.amount);
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);
}

export default function PaymentsTable({ payments, loading }) {
  const total = sumPayments(payments);

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableCaption>Recorded payments for your loans</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Payment ID</TableHead>
            <TableHead>Loan</TableHead>
            <TableHead>Target</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Paid on</TableHead>
            <TableHead>Recorded by</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading &&
            (payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <PaymentRow key={payment.payment_id} payment={payment} />
              ))
            ))}
        </TableBody>
        {!loading && payments.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatAmount(total)}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
