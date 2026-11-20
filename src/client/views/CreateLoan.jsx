import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CreateLoanForm from "@/components/loans/CreateLoanForm";
import InstallmentPreview from "@/components/loans/InstallmentPreview";
import { useCreateLoanForm } from "@/client/hooks/useCreateLoanForm";

export default function CreateLoan() {
  const loanForm = useCreateLoanForm();

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create loan</CardTitle>
          <CardDescription>
            Complete the loan details, review the generated installments, then
            approve the creation.
          </CardDescription>
        </CardHeader>

        {loanForm.preview ? (
          <InstallmentPreview
            preview={loanForm.preview}
            interestPaymentMode={loanForm.form.interest_payment_mode}
            error={loanForm.error}
            submitting={loanForm.submitting}
            onBack={loanForm.backToEdit}
            onApprove={loanForm.handleApprove}
          />
        ) : (
          <CreateLoanForm {...loanForm} />
        )}
      </Card>
    </main>
  );
}
