import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/client/utils/loanFormat";
import PaymentModalFields from "@/components/payments/PaymentModalFields";

export default function InstallmentPaymentModal({
  isOpen,
  onClose,
  loanId,
  installment,
  paidAt,
  onPaidAtChange,
  error,
  submitting,
  onConfirm,
}) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle>Record installment payment</DialogTitle>
          <DialogDescription>
            Loan #{loanId} · {installment?.label || "Installment"} · due{" "}
            {formatDate(installment?.dueDate)}
          </DialogDescription>
        </DialogHeader>

        <PaymentModalFields
          amount={installment?.amount}
          paidAt={paidAt}
          onPaidAtChange={onPaidAtChange}
          error={error}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? "Recording..." : "Record payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
