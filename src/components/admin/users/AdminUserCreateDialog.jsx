import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { stakeholderName } from "@/client/utils/loanForm";

export default function AdminUserCreateDialog({
    open,
    values,
    fieldErrors,
    stakeholders,
    loading,
    error,
    saving,
    refreshing,
    credential,
    onChange,
    onClose,
    onRefresh,
    onSave,
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose();
            }}
        >
            <DialogContent showCloseButton={false} className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>New user</DialogTitle>
                    <DialogDescription>
                        Create an account for a stakeholder and assign its role.
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

                {credential?.password ? (
                    <div className="grid gap-4">
                        <p
                            role="status"
                            className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
                        >
                            User created. Copy the temporary password now; it
                            will not be shown again.
                        </p>
                        <p className="text-sm text-destructive">
                            This is the only time the password will be
                            displayed.
                        </p>
                        <div className="grid gap-2">
                            <Label htmlFor="admin-user-temporary-password">
                                Temporary password
                            </Label>
                            <Input
                                id="admin-user-temporary-password"
                                type="text"
                                readOnly
                                value={credential.password}
                                onFocus={(event) => event.target.select()}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Send it securely to the user. They must change it
                            at their next sign-in.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="admin-user-create-email">Email</Label>
                            <Input
                                id="admin-user-create-email"
                                name="email"
                                type="email"
                                autoComplete="off"
                                placeholder="user@example.com"
                                aria-invalid={Boolean(fieldErrors.email)}
                                aria-describedby={
                                    fieldErrors.email
                                        ? "admin-user-create-email-error"
                                        : undefined
                                }
                                value={values.email}
                                onChange={(event) =>
                                    onChange("email", event.target.value)
                                }
                            />
                            {fieldErrors.email && (
                                <p
                                    id="admin-user-create-email-error"
                                    className="text-sm text-destructive"
                                >
                                    {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="admin-user-create-role">Role</Label>
                            <Select
                                value={values.role_name}
                                onValueChange={(value) =>
                                    onChange("role_name", value)
                                }
                                disabled={saving}
                            >
                                <SelectTrigger
                                    id="admin-user-create-role"
                                    className="w-full"
                                    aria-invalid={Boolean(fieldErrors.role_name)}
                                    aria-describedby={
                                        fieldErrors.role_name
                                            ? "admin-user-create-role-error"
                                            : undefined
                                    }
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="lender">
                                        Lender
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldErrors.role_name && (
                                <p
                                    id="admin-user-create-role-error"
                                    className="text-sm text-destructive"
                                >
                                    {fieldErrors.role_name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="admin-user-create-stakeholder">
                                Stakeholder
                            </Label>
                            <Select
                                value={values.stakeholder_id}
                                onValueChange={(value) =>
                                    onChange("stakeholder_id", value)
                                }
                                disabled={loading || saving}
                            >
                                <SelectTrigger
                                    id="admin-user-create-stakeholder"
                                    className="w-full"
                                    aria-invalid={Boolean(
                                        fieldErrors.stakeholder_id,
                                    )}
                                    aria-describedby={
                                        fieldErrors.stakeholder_id
                                            ? "admin-user-create-stakeholder-error"
                                            : undefined
                                    }
                                >
                                    <SelectValue
                                        placeholder={
                                            loading
                                                ? "Loading stakeholders..."
                                                : "Select a stakeholder"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {stakeholders.map((stakeholder) => (
                                        <SelectItem
                                            key={stakeholder.stakeholder_id}
                                            value={String(
                                                stakeholder.stakeholder_id,
                                            )}
                                        >
                                            {stakeholderName(stakeholder)} (ID{" "}
                                            {stakeholder.stakeholder_id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldErrors.stakeholder_id && (
                                <p
                                    id="admin-user-create-stakeholder-error"
                                    className="text-sm text-destructive"
                                >
                                    {fieldErrors.stakeholder_id}
                                </p>
                            )}
                            {!loading && stakeholders.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No stakeholders available. Create one first.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {credential?.password ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onRefresh}
                                disabled={refreshing}
                            >
                                {refreshing ? "Refreshing..." : "Refresh list"}
                            </Button>
                            <Button type="button" onClick={onClose}>
                                Done
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={onSave}
                                disabled={
                                    saving ||
                                    loading ||
                                    stakeholders.length === 0
                                }
                            >
                                {saving ? "Creating..." : "Create user"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
