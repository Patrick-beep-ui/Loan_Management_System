import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentsHeader({
  refreshing,
  recording,
  onRefresh,
  onRecord,
}) {
  return (
    <CardHeader className="relative">
      <CardTitle className="text-2xl">Payments</CardTitle>
      <CardDescription>
        Review recorded payments and register pending installments or interest
        on your loans.
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
