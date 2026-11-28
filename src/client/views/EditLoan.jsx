import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import CreateLoanForm from "@/components/loans/create/CreateLoanForm";
import InstallmentPreview from "@/components/loans/create/InstallmentPreview";
import EditLoanError from "@/components/loans/edit/EditLoanError";
import EditLoanHeader from "@/components/loans/edit/EditLoanHeader";
import EditLockedAlert from "@/components/loans/edit/EditLockedAlert";
import RestrictedLoanEditForm from "@/components/loans/edit/RestrictedLoanEditForm";
import { useEditLoanForm } from "@/client/hooks/useEditLoanForm";

export default function EditLoan() {
  const navigate = useNavigate();
  const edit = useEditLoanForm();

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <EditLoanHeader
        loanId={edit.id}
        hasPayments={edit.hasPayments}
        onBack={() => navigate(`/loans/${edit.id}`)}
      />

      <CardContent>
        <EditLoanError
          error={edit.loadError}
          notFound={edit.notFound}
          onRetry={edit.fetchLoan}
          onBack={() => navigate("/loans")}
        />

        {!edit.loadingLoan &&
          !edit.notFound && (
            <div className="space-y-6">
              {edit.hasPayments && <EditLockedAlert />}

              {edit.hasPayments ? (
                <RestrictedLoanEditForm {...edit} />
              ) : edit.preview ? (
                <InstallmentPreview
                  preview={edit.preview}
                  interestPaymentMode={edit.form.interest_payment_mode}
                  error={edit.error}
                  submitting={edit.submitting}
                  approveLabel="Save changes"
                  creatingLabel="Saving..."
                  onBack={edit.backToEdit}
                  onApprove={edit.handleApprove}
                />
              ) : (
                <CreateLoanForm {...edit} submitLabel="Preview changes" />
              )}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
