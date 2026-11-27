import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/client/utils/loanFormat";
import { stakeholderName } from "@/client/utils/loanForm";

export default function AdminStakeholderRow({ stakeholder, onEdit, onDelete }) {
    return (
        <TableRow>
            <TableCell>{stakeholder.stakeholder_id}</TableCell>
            <TableCell>
                <Link
                    to={`/admin/stakeholders/${stakeholder.stakeholder_id}`}
                    className="text-foreground underline-offset-4 hover:underline"
                >
                    {stakeholderName(stakeholder)}
                </Link>
            </TableCell>
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
