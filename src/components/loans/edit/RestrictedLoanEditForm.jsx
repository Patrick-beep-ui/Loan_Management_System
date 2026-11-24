import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorAlert from "@/components/loans/create/ErrorAlert";
import FormField from "@/components/loans/create/FormField";
import GuarantorsFieldArray from "@/components/loans/create/GuarantorsFieldArray";
import CollateralsFieldArray from "@/components/loans/create/CollateralsFieldArray";
import { stakeholderName } from "@/client/utils/loanForm";

export default function RestrictedLoanEditForm({
  error,
  form,
  guarantors,
  collaterals,
  stakeholders,
  loadingStakeholders,
  isAdmin,
  stakeholderPlaceholder,
  updateForm,
  updateGuarantor,
  addGuarantor,
  removeGuarantor,
  updateCollateral,
  addCollateral,
  removeCollateral,
  handleApprove,
  submitting,
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleApprove();
      }}
    >
      <CardContent className="space-y-6">
        <ErrorAlert message={error} />

        {isAdmin && (
          <FormField id="restricted_lender_id" label="Lender">
            <Select
              value={form.lender_id}
              onValueChange={(value) => updateForm("lender_id", value)}
            >
              <SelectTrigger
                id="restricted_lender_id"
                className="w-full sm:max-w-sm"
                disabled={loadingStakeholders}
              >
                <SelectValue placeholder={stakeholderPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {stakeholders.map((stakeholder) => (
                  <SelectItem
                    key={stakeholder.stakeholder_id}
                    value={String(stakeholder.stakeholder_id)}
                  >
                    {stakeholderName(stakeholder)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}

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
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </form>
  );
}
