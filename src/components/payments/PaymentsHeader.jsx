import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentsHeader({ refreshing, onRefresh, onBack }) {
  return (
    <CardHeader className="relative">
      <CardTitle className="text-2xl">Payments</CardTitle>
      <CardDescription>
        Payments recorded against loans assigned to your lender account.
      </CardDescription>
      <CardAction>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Back to loans
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardAction>
    </CardHeader>
  );
}
