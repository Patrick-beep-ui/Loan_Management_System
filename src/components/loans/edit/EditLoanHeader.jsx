import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EditLoanHeader({ loanId, locked, onBack }) {
  return (
    <CardHeader>
      <CardTitle className="text-2xl">Edit loan #{loanId}</CardTitle>
      <CardDescription>
        {locked
          ? "This loan has recorded payments and can no longer be edited."
          : "Update the loan terms, then review the new installment schedule."}
      </CardDescription>
      <CardAction>
        <Button type="button" variant="outline" onClick={onBack}>
          Back to loan
        </Button>
      </CardAction>
    </CardHeader>
  );
}
