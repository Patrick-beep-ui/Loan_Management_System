import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoanListHeader({ description, onCreateLoan }) {
  return (
    <CardHeader>
      <CardTitle className="text-2xl">Loans</CardTitle>
      <CardDescription>{description}</CardDescription>
      <CardAction>
        <Button type="button" onClick={onCreateLoan}>
          New loan
        </Button>
      </CardAction>
    </CardHeader>
  );
}
