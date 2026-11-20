import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fullName } from "@/client/utils/loanFormat";

export default function LoanGuarantorsList({ guarantors }) {
  const rows = Array.isArray(guarantors) ? guarantors : [];

  return (
    <section className="space-y-3">
      <h3 className="font-medium">Guarantors</h3>
      <Table>
        <TableCaption>Guarantors linked to this loan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Stakeholder ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                No guarantors found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((item, index) => (
              <TableRow key={item.loan_guarantor_id ?? index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{fullName(item.guarantor)}</TableCell>
                <TableCell>
                  {item.guarantor?.stakeholder_id ??
                    item.guarantor_stakeholder_id ??
                    "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}
