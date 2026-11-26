import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/client/utils/loanFormat";
import { stakeholderName } from "@/client/utils/loanForm";

export default function AdminStakeholderRow({ stakeholder, onEdit, onDelete }) {
    return (
        <TableRow>
            <TableCell>{stakeholder.stakeholder_id}</TableCell>
            <TableCell>{stakeholderName(stakeholder)}</TableCell>
            <TableCell>{stakeholder.national_id || "—"}</TableCell>
            <TableCell>{stakeholder.marital_status || "—"}</TableCell>
            <TableCell>{stakeholder.occupation || "—"}</TableCell>
            <TableCell>{formatDate(stakeholder.date_of_birth)}</TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(stakeholder)}
                    >
                        Edit
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(stakeholder)}
                    >
                        Delete
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
