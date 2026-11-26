import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPaymentsHeader({
  refreshing,
  recording,
  onRefresh,
  onRecord,
}) {
  return (
    <CardHeader>
      <CardTitle>Payments</CardTitle>
      <CardDescription>
        Review recorded payments, register pending installments or interest, and
        revert mistakes.
      </CardDescription>
      <CardAction className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing || recording}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onRecord}
          disabled={recording}
        >
          Record payment
        </Button>
      </CardAction>
    </CardHeader>
  );
}
