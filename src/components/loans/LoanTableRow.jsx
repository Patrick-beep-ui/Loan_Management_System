import { TableCell, TableRow } from "@/components/ui/table";
import {
  formatAmount,
  formatDate,
  formatRate,
  fullName,
} from "@/client/utils/loanFormat";

export default function LoanTableRow({ loan }) {
  return (
    <TableRow>
      <TableCell>{loan.loan_id}</TableCell>
      <TableCell>{fullName(loan.lender)}</TableCell>
      <TableCell>{fullName(loan.customer)}</TableCell>
      <TableCell>{formatAmount(loan.loan_amount)}</TableCell>
      <TableCell>{formatRate(loan.interest_rate)}</TableCell>
      <TableCell>{loan.interest_payment_mode}</TableCell>
      <TableCell>{formatDate(loan.disbursed_at)}</TableCell>
      <TableCell>{formatAmount(loan.total_to_pay)}</TableCell>
    </TableRow>
  );
}
