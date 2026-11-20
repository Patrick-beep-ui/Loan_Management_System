import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoanDetailsHeader({
  loanId,
  locked,
  onBack,
  onEdit,
  onDelete,
}) {
  return (
    <CardHeader>
      <CardTitle className="text-2xl">Loan #{loanId}</CardTitle>
      <CardDescription>
        {locked
          ? "This loan has recorded payments and can no longer be edited or deleted."
          : "Review the loan details, edit its terms, or delete the record."}
      </CardDescription>
      <CardAction>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onBack}>
            Back to loans
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onEdit}
            disabled={locked}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={locked}
          >
            Delete
          </Button>
        </div>
      </CardAction>
    </CardHeader>
  );
}
