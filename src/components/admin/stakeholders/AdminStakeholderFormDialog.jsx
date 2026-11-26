import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import StakeholderFormFields from "@/components/admin/stakeholders/StakeholderFormFields";

export default function AdminStakeholderFormDialog({
    mode,
    values,
    fieldErrors,
    error,
    saving,
    onChange,
    onClose,
    onSave,
}) {
    const isEdit = mode === "edit";

    return (
        <Dialog
            open={Boolean(mode)}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose();
            }}
        >
            <DialogContent showCloseButton={false} className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit stakeholder" : "New stakeholder"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the person's details."
                            : "Add a person to use as a lender, customer, or guarantor."}
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

                <StakeholderFormFields
                    values={values}
                    fieldErrors={fieldErrors}
                    onChange={onChange}
                />

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
                        {saving
                            ? "Saving..."
                            : isEdit
                              ? "Save changes"
                              : "Create stakeholder"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
