import { Link } from "react-router-dom";

import { TableCell, TableRow } from "@/components/ui/table";
import { formatAmount, formatDate } from "@/client/utils/loanFormat";

function getTargetLabel(payment) {
  const installment = payment.InstallmentPayment?.LoanInstallment;

  if (installment) return `Installment #${installment.installment_number}`;
  if (payment.InstallmentPayment) return "Installment";
  return "Ordinary interest";
}

export default function PaymentRow({ payment }) {
  const installment = payment.InstallmentPayment?.LoanInstallment;
  const loanId = installment?.loan_id ?? payment.LoanInterestPayment?.loan_id;

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
      <TableCell>{getTargetLabel(payment)}</TableCell>
      <TableCell className="text-right tabular-nums">
        {formatAmount(payment.amount)}
      </TableCell>
      <TableCell>{formatDate(payment.paid_at)}</TableCell>
      <TableCell>{payment.recordedBy?.email || "—"}</TableCell>
    </TableRow>
  );
}
