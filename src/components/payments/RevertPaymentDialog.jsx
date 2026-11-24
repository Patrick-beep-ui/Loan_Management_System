import ErrorAlert from "@/components/loans/create/ErrorAlert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAmount, formatDate } from "@/client/utils/loanFormat";

export default function RevertPaymentDialog({
  open,
  target,
  error,
  reverting,
  onClose,
  onConfirm,
}) {
  const detail =
    target && (target.amount !== undefined || target.paidAt)
      ? `${formatAmount(target.amount)} · ${formatDate(target.paidAt)}`
      : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            Revert {target?.label ? `${target.label} payment` : "payment"}?
          </DialogTitle>
          <DialogDescription>
            This deletes the payment record and returns the installment or
            interest to pending. The loan will be editable again. This action
            cannot be undone.
          </DialogDescription>
          {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
        </DialogHeader>

        <ErrorAlert message={error} />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={reverting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={reverting}
          >
            {reverting ? "Reverting..." : "Revert payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
