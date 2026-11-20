import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ErrorAlert from "@/components/loans/create/ErrorAlert";

export default function DeleteLoanDialog({
  open,
  loanId,
  error,
  deleting,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete loan #{loanId}?</DialogTitle>
          <DialogDescription>
            This permanently removes the loan, its installments, guarantors and
            collaterals. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <ErrorAlert message={error} />

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
            {deleting ? "Deleting..." : "Delete loan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
