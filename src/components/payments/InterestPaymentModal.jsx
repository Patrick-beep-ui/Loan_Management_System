import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PaymentModalFields from "@/components/payments/PaymentModalFields";

export default function InterestPaymentModal({
  isOpen,
  onClose,
  loanId,
  interest,
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
          <DialogTitle>Record interest payment</DialogTitle>
          <DialogDescription>
            Loan #{loanId} · separate ordinary interest obligation
          </DialogDescription>
        </DialogHeader>

        <PaymentModalFields
          amount={interest?.amount}
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
