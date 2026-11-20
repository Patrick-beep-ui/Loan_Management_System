import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/client/utils/loanForm";
import ErrorAlert from "@/components/loans/create/ErrorAlert";

export default function InstallmentPreview({
  preview,
  interestPaymentMode,
  error,
  submitting,
  onBack,
  onApprove,
}) {
  return (
    <>
      <CardContent className="space-y-6">
        <ErrorAlert message={error} />

        <div className="grid gap-3 rounded-lg border border-border bg-muted/50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Principal</p>
            <p className="font-medium tabular-nums">
              {formatMoney(preview.summary.principalCents / 100)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {interestPaymentMode === "included"
                ? "Interest included"
                : "Interest billed separately"}
            </p>
            <p className="font-medium tabular-nums">
              {formatMoney(preview.summary.interestCents / 100)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {interestPaymentMode === "included"
                ? "Schedule total"
                : "Schedule total (principal)"}
            </p>
            <p className="font-medium tabular-nums">
              {formatMoney(preview.summary.scheduleCents / 100)}
            </p>
          </div>
        </div>

        <Table>
          <TableCaption>Installments generated before approval</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead className="text-right">Amount due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.installments.map((installment) => (
              <TableRow key={installment.installment_number}>
                <TableCell>{installment.installment_number}</TableCell>
                <TableCell>{installment.due_date}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(installment.amount_due)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {interestPaymentMode === "separate" && (
          <p className="text-sm text-muted-foreground">
            A pending interest obligation of{" "}
            {formatMoney(preview.summary.interestCents / 100)} will be created
            separately from these installments.
          </p>
        )}
      </CardContent>

      <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={submitting}
        >
          Back to edit
        </Button>
        <Button type="button" onClick={onApprove} disabled={submitting}>
          {submitting ? "Creating loan..." : "Approve & create"}
        </Button>
      </CardFooter>
    </>
  );
}
