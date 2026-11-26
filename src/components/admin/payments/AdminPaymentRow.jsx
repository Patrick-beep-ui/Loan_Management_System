import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatAmount, formatDate } from "@/client/utils/loanFormat";

export default function AdminPaymentRow({ payment, onRevert, actionsDisabled }) {
  const installment = payment.InstallmentPayment?.LoanInstallment;
  const loanId = installment?.loan_id ?? payment.LoanInterestPayment?.loan_id;
  const targetLabel = installment
    ? `Installment #${installment.installment_number}`
    : "Ordinary interest";

  return (
    <TableRow>
      <TableCell className="font-medium">{payment.payment_id}</TableCell>
      <TableCell>
        {loanId ? (
          <Link
            to={`/loans/${loanId}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            #{loanId}
          </Link>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell>{targetLabel}</TableCell>
      <TableCell className="tabular-nums">
        {formatAmount(payment.amount)}
      </TableCell>
      <TableCell>{formatDate(payment.paid_at)}</TableCell>
      <TableCell>{payment.recordedBy?.email || "—"}</TableCell>
      <TableCell>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRevert(payment)}
          disabled={actionsDisabled}
        >
          Revert
        </Button>
      </TableCell>
    </TableRow>
  );
}
