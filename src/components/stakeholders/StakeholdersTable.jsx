import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StakeholderRow from "@/components/stakeholders/StakeholderRow";

export default function StakeholdersTable({ rows, loading }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableCaption>People linked to your loans</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>National ID</TableHead>
            <TableHead>Occupation</TableHead>
            <TableHead>Loan roles</TableHead>
            <TableHead>Loans</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading &&
            (rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No stakeholders found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <StakeholderRow key={row.stakeholderId} row={row} />
              ))
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
