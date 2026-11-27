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
import StakeholderFormFields from "@/components/admin/stakeholders/StakeholderFormFields";
import { adminUserDisplayName } from "@/client/utils/userForm";

export default function AdminUserEditDialog({
    user,
    formValues,
    stakeholderValues,
    stakeholderFieldErrors,
    stakeholderLoading,
    stakeholderReady,
    error,
    saving,
    onChange,
    onStakeholderChange,
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
            <DialogContent showCloseButton={false} className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit user</DialogTitle>
                    <DialogDescription>
                        Update role and access, plus linked stakeholder details
                        when available for {adminUserDisplayName(user)}.
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

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="admin-user-role">Role</Label>
                        <Select
                            value={formValues.role_name}
                            onValueChange={(value) =>
                                onChange("role_name", value)
                            }
                        >
                            <SelectTrigger
                                id="admin-user-role"
                                className="w-full"
                            >
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
                            <SelectTrigger
                                id="admin-user-status"
                                className="w-full"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {user?.stakeholder_id && (
                        <div className="space-y-3 border-t border-border pt-4">
                            <div className="space-y-1">
                                <h3 className="text-base font-medium">
                                    Stakeholder data
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Details linked to this account.
                                </p>
                            </div>
                            {stakeholderLoading ? null : stakeholderReady ? (
                                <StakeholderFormFields
                                    values={stakeholderValues}
                                    fieldErrors={stakeholderFieldErrors}
                                    onChange={onStakeholderChange}
                                    idPrefix="user-stakeholder"
                                />
                            ) : (
                                <p className="text-sm text-destructive">
                                    Stakeholder details could not be loaded. Only
                                    role and status can be edited.
                                </p>
                            )}
                        </div>
                    )}
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
