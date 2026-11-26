import { Button } from "@/components/ui/button";
import {
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AdminUsersHeader({ description, refreshing, onRefresh }) {
    return (
        <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>{description}</CardDescription>
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
