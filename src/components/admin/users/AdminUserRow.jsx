import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { adminUserDisplayName } from "@/client/utils/userForm";

export default function AdminUserRow({ user, onEdit }) {
    return (
        <TableRow>
            <TableCell>{adminUserDisplayName(user)}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.Role?.role_name || "—"}</TableCell>
            <TableCell>{user.is_active ? "Active" : "Inactive"}</TableCell>
            <TableCell>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                >
                    Edit
                </Button>
            </TableCell>
        </TableRow>
    );
}
