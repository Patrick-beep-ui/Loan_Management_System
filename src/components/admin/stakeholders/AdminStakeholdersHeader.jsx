import { Button } from "@/components/ui/button";
import {
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AdminStakeholdersHeader({
    refreshing,
    onRefresh,
    onCreate,
}) {
    return (
        <CardHeader>
            <CardTitle>Stakeholders</CardTitle>
            <CardDescription>
                Create, edit, and remove people used by loans.
            </CardDescription>
            <CardAction>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                    <Button type="button" size="sm" onClick={onCreate}>
                        New stakeholder
                    </Button>
                </div>
            </CardAction>
        </CardHeader>
    );
}
