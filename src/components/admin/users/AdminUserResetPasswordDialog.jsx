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

export default function AdminUserResetPasswordDialog({
    user,
    credential,
    error,
    resetting,
    refreshing,
    onClose,
    onRefresh,
    onConfirm,
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
                    <DialogTitle>Reset password</DialogTitle>
                    <DialogDescription>
                        {credential?.password
                            ? "The temporary password is ready to share with the user."
                            : `A new temporary password will replace the current one for ${user?.email || "this user"}.`}
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
                            Password reset. Copy the temporary password now; it
                            will not be shown again.
                        </p>
                        <p className="text-sm text-destructive">
                            This is the only time the password will be
                            displayed.
                        </p>
                        <div className="grid gap-2">
                            <Label htmlFor="admin-user-reset-password">
                                Temporary password
                            </Label>
                            <Input
                                id="admin-user-reset-password"
                                type="text"
                                readOnly
                                value={credential.password}
                                onFocus={(event) => event.target.select()}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            The user must change it at their next sign-in.
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        The user will be required to choose a new password after
                        signing in with the temporary one.
                    </p>
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
                                disabled={resetting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={onConfirm}
                                disabled={resetting}
                            >
                                {resetting ? "Resetting..." : "Reset password"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
