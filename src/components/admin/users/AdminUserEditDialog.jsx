import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { adminUserDisplayName } from "@/client/utils/userForm";

export default function AdminUserEditDialog({
    user,
    formValues,
    error,
    saving,
    onChange,
    onClose,
    onSave,
}) {
    return (
        <Dialog
            open={Boolean(user)}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose();
            }}
        >
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Edit user</DialogTitle>
                    <DialogDescription>
                        Update the role or access state for{" "}
                        {adminUserDisplayName(user)}.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div
                        role="alert"
                        className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                        {error}
                    </div>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="admin-user-role">Role</Label>
                    <Select
                        value={formValues.role_name}
                        onValueChange={(value) => onChange("role_name", value)}
                    >
                        <SelectTrigger id="admin-user-role" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="lender">Lender</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="admin-user-status">Status</Label>
                    <Select
                        value={formValues.is_active ? "active" : "inactive"}
                        onValueChange={(value) =>
                            onChange("is_active", value === "active")
                        }
                    >
                        <SelectTrigger id="admin-user-status" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button type="button" onClick={onSave} disabled={saving}>
                        {saving ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
