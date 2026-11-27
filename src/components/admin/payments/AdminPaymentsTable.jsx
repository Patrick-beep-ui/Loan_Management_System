import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminPaymentRow from "@/components/admin/payments/AdminPaymentRow";

export default function AdminPaymentsTable({
  payments,
  loading,
  onRevert,
  actionsDisabled,
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment ID</TableHead>
            <TableHead>Loan</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Paid on</TableHead>
            <TableHead>Recorded by</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading && payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>No payments found.</TableCell>
            </TableRow>
          )}
          {!loading &&
            payments.map((payment) => (
              <AdminPaymentRow
                key={payment.payment_id}
                payment={payment}
                onRevert={onRevert}
                actionsDisabled={actionsDisabled}
              />
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
