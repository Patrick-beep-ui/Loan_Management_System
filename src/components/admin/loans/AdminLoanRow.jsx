import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
    formatAmount,
    formatDate,
    formatRate,
    fullName,
} from "@/client/utils/loanFormat";

export default function AdminLoanRow({ loan, onReassign }) {
    return (
        <TableRow>
            <TableCell>
                <Link
                    to={`/loans/${loan.loan_id}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                    {loan.loan_id}
                </Link>
            </TableCell>
            <TableCell>{fullName(loan.lender)}</TableCell>
            <TableCell>{fullName(loan.customer)}</TableCell>
            <TableCell>{formatAmount(loan.loan_amount)}</TableCell>
            <TableCell>{formatRate(loan.interest_rate)}</TableCell>
            <TableCell>{loan.interest_payment_mode}</TableCell>
            <TableCell>{formatDate(loan.disbursed_at)}</TableCell>
            <TableCell>{formatAmount(loan.total_to_pay)}</TableCell>
            <TableCell>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onReassign(loan)}
                >
                    Reassign lender
                </Button>
            </TableCell>
        </TableRow>
    );
}
