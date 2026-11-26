import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { stakeholderName } from "@/client/utils/loanForm";

export default function DeleteStakeholderDialog({
    stakeholder,
    error,
    deleting,
    onClose,
    onConfirm,
}) {
    return (
        <Dialog
            open={Boolean(stakeholder)}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose();
            }}
        >
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Delete stakeholder?</DialogTitle>
                    <DialogDescription>
                        {stakeholderName(stakeholder)} will be removed. A
                        stakeholder referenced by a user or loan cannot be
                        deleted.
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

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={deleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Delete stakeholder"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
