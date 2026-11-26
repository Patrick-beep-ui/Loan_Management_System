import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboardHeader({ loading, onRefresh }) {
  return (
    <CardHeader>
      <CardTitle>Dashboard</CardTitle>
      <CardDescription>
        Loan, payment, and overdue metrics from the current portfolio.
      </CardDescription>
      <CardAction>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </CardAction>
    </CardHeader>
  );
}
