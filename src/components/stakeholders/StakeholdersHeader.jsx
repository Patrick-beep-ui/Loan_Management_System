import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StakeholdersHeader({ refreshing, onRefresh }) {
  return (
    <CardHeader>
      <CardTitle className="text-2xl">Stakeholders</CardTitle>
      <CardDescription>
        People connected to your loans as customers or guarantors.
      </CardDescription>
      <CardAction>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </CardAction>
    </CardHeader>
  );
}
