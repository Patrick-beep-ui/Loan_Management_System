import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AdminStakeholderRow from "@/components/admin/stakeholders/AdminStakeholderRow";

export default function AdminStakeholdersTable({
    stakeholders,
    loading,
    emptyMessage = "No stakeholders found.",
    onEdit,
    onDelete,
}) {
    return (
        <div className="rounded-lg border border-border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>National ID</TableHead>
                        <TableHead>Marital status</TableHead>
                        <TableHead>Occupation</TableHead>
                        <TableHead>Date of birth</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                        <TableRow>
                            <TableCell colSpan={7}>
                                Loading stakeholders...
                            </TableCell>
                        </TableRow>
                    )}
                    {!loading && stakeholders.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7}>
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                    {!loading &&
                        stakeholders.map((stakeholder) => (
                            <AdminStakeholderRow
                                key={stakeholder.stakeholder_id}
                                stakeholder={stakeholder}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
