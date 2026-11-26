import { Button } from "@/components/ui/button";

export default function AdminLoansAlerts({
    error,
    success,
    onDismissError,
    onDismissSuccess,
}) {
    return (
        <div className="space-y-2">
            {error && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                    <span>{error}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={onDismissError}
                    >
                        Dismiss
                    </Button>
                </div>
            )}
            {success && (
                <div
                    role="status"
                    className="flex items-center justify-between gap-3 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
                >
                    <span>{success}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={onDismissSuccess}
                    >
                        Dismiss
                    </Button>
                </div>
            )}
        </div>
    );
}
