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
import { fullName } from "@/client/utils/loanFormat";

export default function ReassignLenderDialog({
    loan,
    lenderUsers,
    loadingLenders,
    selectedLenderId,
    error,
    saving,
    onSelect,
    onClose,
    onSave,
}) {
    const options = lenderUsers.filter(
        (option) => String(option.stakeholder_id) !== String(loan?.customer_id),
    );

    return (
        <Dialog
            open={Boolean(loan)}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose();
            }}
        >
            <DialogContent showCloseButton={false} className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reassign lender</DialogTitle>
                    <DialogDescription>
                        Choose a new lender for loan {loan?.loan_id}. Current
                        lender: {fullName(loan?.lender)}.
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
                    <Label htmlFor="admin-loan-lender">Lender</Label>
                    <Select
                        value={selectedLenderId}
                        onValueChange={onSelect}
                        disabled={loadingLenders || saving}
                    >
                        <SelectTrigger
                            id="admin-loan-lender"
                            className="w-full"
                        >
                            <SelectValue
                                placeholder={
                                    loadingLenders
                                        ? "Loading lender accounts..."
                                        : "Select a lender"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem
                                    key={option.stakeholder_id}
                                    value={String(option.stakeholder_id)}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!loadingLenders && options.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No lender accounts available.
                        </p>
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
                    <Button
                        type="button"
                        onClick={onSave}
                        disabled={saving || loadingLenders || options.length === 0}
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
