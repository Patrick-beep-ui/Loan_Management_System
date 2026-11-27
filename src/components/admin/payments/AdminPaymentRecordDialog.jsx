import ErrorAlert from "@/components/loans/create/ErrorAlert";
import PaymentModalFields from "@/components/payments/PaymentModalFields";
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

export default function AdminPaymentRecordDialog({
  open,
  loanOptions,
  targetOptions,
  selectedLoanId,
  selectedTargetKey,
  selectedTarget,
  paidAt,
  error,
  loadingLoans,
  submitting,
  onLoanChange,
  onTargetChange,
  onPaidAtChange,
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
      <DialogContent className="sm:max-w-lg" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Choose a loan and a pending installment or interest obligation. The
            amount comes from the loan and cannot be edited.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <ErrorAlert message={error} />

          <div className="grid gap-2">
            <Label htmlFor="admin-payment-loan">Loan</Label>
            <Select
              value={selectedLoanId}
              onValueChange={onLoanChange}
              disabled={loadingLoans || submitting || loanOptions.length === 0}
            >
              <SelectTrigger id="admin-payment-loan" className="w-full">
                <SelectValue
                  placeholder={
                    !loadingLoans && loanOptions.length === 0
                      ? "No loans with pending targets"
                      : "Select a loan"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {loanOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!loadingLoans && loanOptions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No loans have pending installments or interest obligations.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin-payment-target">Payment target</Label>
            <Select
              value={selectedTargetKey}
              onValueChange={onTargetChange}
              disabled={
                submitting || !selectedLoanId || targetOptions.length === 0
              }
            >
              <SelectTrigger id="admin-payment-target" className="w-full">
                <SelectValue
                  placeholder={
                    !selectedLoanId
                      ? "Select a loan first"
                      : targetOptions.length === 0
                        ? "No pending targets"
                        : "Select a payment target"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {targetOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLoanId && targetOptions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                This loan has no pending installments or interest obligations.
              </p>
            )}
          </div>

          <PaymentModalFields
            amount={selectedTarget?.amount}
            paidAt={paidAt}
            onPaidAtChange={onPaidAtChange}
            error=""
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={submitting || !selectedTarget}
          >
            {submitting ? "Recording..." : "Record payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
