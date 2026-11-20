import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import CollateralsFieldArray from "@/components/loans/create/CollateralsFieldArray";
import ErrorAlert from "@/components/loans/create/ErrorAlert";
import GuarantorsFieldArray from "@/components/loans/create/GuarantorsFieldArray";
import LoanDetailsFields from "@/components/loans/create/LoanDetailsFields";

export default function CreateLoanForm({
  error,
  form,
  guarantors,
  collaterals,
  stakeholders,
  loadingStakeholders,
  isAdmin,
  user,
  customerOptions,
  stakeholderPlaceholder,
  updateForm,
  updateGuarantor,
  addGuarantor,
  removeGuarantor,
  updateCollateral,
  addCollateral,
  removeCollateral,
  handlePreview,
}) {
  return (
    <form onSubmit={handlePreview}>
      <CardContent className="space-y-6">
        <ErrorAlert message={error} />

        <LoanDetailsFields
          form={form}
          onChange={updateForm}
          stakeholders={stakeholders}
          loadingStakeholders={loadingStakeholders}
          isAdmin={isAdmin}
          user={user}
          customerOptions={customerOptions}
          stakeholderPlaceholder={stakeholderPlaceholder}
        />

        <GuarantorsFieldArray
          values={guarantors}
          stakeholders={stakeholders}
          loadingStakeholders={loadingStakeholders}
          stakeholderPlaceholder={stakeholderPlaceholder}
          onChange={updateGuarantor}
          onAdd={addGuarantor}
          onRemove={removeGuarantor}
        />

        <CollateralsFieldArray
          values={collaterals}
          onChange={updateCollateral}
          onAdd={addCollateral}
          onRemove={removeCollateral}
        />
      </CardContent>

      <CardFooter>
        <Button type="submit" className="w-full">
          Preview installments
        </Button>
      </CardFooter>
    </form>
  );
}
