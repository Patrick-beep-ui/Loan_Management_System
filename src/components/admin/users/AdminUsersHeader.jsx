import { Button } from "@/components/ui/button";
import {
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AdminUsersHeader({
    description,
    refreshing,
    onRefresh,
    onCreate,
}) {
    return (
        <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>{description}</CardDescription>
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
                        New user
                    </Button>
                </div>
            </CardAction>
        </CardHeader>
    );
}
