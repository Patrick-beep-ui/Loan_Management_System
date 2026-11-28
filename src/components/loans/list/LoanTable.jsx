import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoanTableRow from "@/components/loans/list/LoanTableRow";

export default function LoanTable({ loans, loading }) {
  return (
    <Table>
      <TableCaption>Loan records</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Loan ID</TableHead>
          <TableHead>Lender</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Loan Amount</TableHead>
          <TableHead>Interest Rate</TableHead>
          <TableHead>Mode</TableHead>
          <TableHead>Disbursed</TableHead>
          <TableHead>Total to Pay</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!loading &&
          (loans.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground"
              >
                No loans found.
              </TableCell>
            </TableRow>
          ) : (
            loans.map((loan) => <LoanTableRow key={loan.loan_id} loan={loan} />)
          ))}
      </TableBody>
    </Table>
  );
}
