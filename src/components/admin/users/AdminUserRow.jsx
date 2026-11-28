import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { adminUserDisplayName } from "@/client/utils/userForm";

export default function AdminUserRow({ user, onEdit, onReset }) {
    return (
        <TableRow>
            <TableCell>{adminUserDisplayName(user)}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.Role?.role_name || "—"}</TableCell>
            <TableCell>
                <div className="flex flex-wrap items-center gap-2">
                    <span>{user.is_active ? "Active" : "Inactive"}</span>
                    {user.must_change_password && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                            Password pending
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onReset(user)}
                    >
                        Reset password
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(user)}
                    >
                        Edit
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
