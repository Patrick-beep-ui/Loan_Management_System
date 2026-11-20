import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount } from "@/client/utils/loanFormat";

export default function LoanCollateralsList({ collaterals }) {
  const rows = Array.isArray(collaterals) ? collaterals : [];

  return (
    <section className="space-y-3">
      <h3 className="font-medium">Collaterals</h3>
      <Table>
        <TableCaption>Assets backing this loan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Estimated value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                No collaterals found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((item, index) => (
              <TableRow key={item.loan_collateral_id ?? index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.description || "—"}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatAmount(item.estimated_value)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}
