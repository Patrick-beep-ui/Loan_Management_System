import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useChangePassword } from "@/client/hooks/useChangePassword";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        values,
        fieldErrors,
        error,
        success,
        submitting,
        change,
        submit,
    } = useChangePassword();
    const redirectTimer = useRef(null);

    useEffect(
        () => () => {
            if (redirectTimer.current) {
                window.clearTimeout(redirectTimer.current);
            }
        },
        [],
    );

    async function handleSubmit(event) {
        event.preventDefault();

        const changed = await submit();
        if (!changed) return;

        const destination = location.state?.from?.pathname || "/loans";
        redirectTimer.current = window.setTimeout(() => {
            navigate(destination, { replace: true });
        }, 800);
    }

    return (
        <main className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-xl shadow-md">
                <CardHeader className="space-y-3 px-8 pt-8">
                    <CardTitle className="text-3xl">Change password</CardTitle>
                    <CardDescription>
                        Choose a new password for your account.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 px-8 py-6">
                        {error && (
                            <p
                                role="alert"
                                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                            >
                                {error}
                            </p>
                        )}
                        {success && (
                            <p
                                role="status"
                                className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
                            >
                                {success} Redirecting...
                            </p>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="current-password">
                                Current password
                            </Label>
                            <Input
                                id="current-password"
                                name="current_password"
                                type="password"
                                autoComplete="current-password"
                                disabled={submitting || Boolean(success)}
                                aria-invalid={Boolean(
                                    fieldErrors.current_password,
                                )}
                                aria-describedby={
                                    fieldErrors.current_password
                                        ? "current-password-error"
                                        : undefined
                                }
                                value={values.current_password}
                                onChange={(event) =>
                                    change(
                                        "current_password",
                                        event.target.value,
                                    )
                                }
                            />
                            {fieldErrors.current_password && (
                                <p
                                    id="current-password-error"
                                    className="text-sm text-destructive"
                                >
                                    {fieldErrors.current_password}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New password</Label>
                            <Input
                                id="new-password"
                                name="new_password"
                                type="password"
                                autoComplete="new-password"
                                disabled={submitting || Boolean(success)}
                                aria-invalid={Boolean(fieldErrors.new_password)}
                                aria-describedby={
                                    fieldErrors.new_password
                                        ? "new-password-error"
                                        : undefined
                                }
                                value={values.new_password}
                                onChange={(event) =>
                                    change("new_password", event.target.value)
                                }
                            />
                            {fieldErrors.new_password && (
                                <p
                                    id="new-password-error"
                                    className="text-sm text-destructive"
                                >
                                    {fieldErrors.new_password}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">
                                Confirm password
                            </Label>
                            <Input
                                id="confirm-password"
                                name="confirm_password"
                                type="password"
                                autoComplete="new-password"
                                disabled={submitting || Boolean(success)}
                                aria-invalid={Boolean(
                                    fieldErrors.confirm_password,
                                )}
                                aria-describedby={
                                    fieldErrors.confirm_password
                                        ? "confirm-password-error"
                                        : undefined
                                }
                                value={values.confirm_password}
                                onChange={(event) =>
                                    change(
                                        "confirm_password",
                                        event.target.value,
                                    )
                                }
                            />
                            {fieldErrors.confirm_password && (
                                <p
                                    id="confirm-password-error"
                                    className="text-sm text-destructive"
                                >
                                    {fieldErrors.confirm_password}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch px-8 pb-8">
                        <Button
                            type="submit"
                            disabled={submitting || Boolean(success)}
                            className="w-full"
                        >
                            {submitting
                                ? "Changing password..."
                                : success
                                  ? "Redirecting..."
                                  : "Change password"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </main>
    );
}
