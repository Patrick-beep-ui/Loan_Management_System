import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AdminUserRow from "@/components/admin/users/AdminUserRow";

export default function AdminUsersTable({ users, loading, onEdit, onReset }) {
    return (
        <div className="rounded-lg border border-border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!loading && users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5}>No users found.</TableCell>
                        </TableRow>
                    )}
                    {!loading &&
                        users.map((user) => (
                            <AdminUserRow
                                key={user.user_id}
                                user={user}
                                onEdit={onEdit}
                                onReset={onReset}
                            />
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
