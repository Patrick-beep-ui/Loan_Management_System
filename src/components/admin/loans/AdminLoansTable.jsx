import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AdminLoanRow from "@/components/admin/loans/AdminLoanRow";

export default function AdminLoansTable({ loans, loading, onReassign }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
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
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!loading && loans.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9}>No loans found.</TableCell>
                        </TableRow>
                    )}
                    {!loading &&
                        loans.map((loan) => (
                            <AdminLoanRow
                                key={loan.loan_id}
                                loan={loan}
                                onReassign={onReassign}
                            />
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
