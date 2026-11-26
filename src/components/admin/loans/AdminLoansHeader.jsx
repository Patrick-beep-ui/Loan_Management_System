import { Button } from "@/components/ui/button";
import {
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AdminLoansHeader({ refreshing, onRefresh }) {
    return (
        <CardHeader>
            <CardTitle>Loans</CardTitle>
            <CardDescription>
                Review every loan and reassign its lender when needed.
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
