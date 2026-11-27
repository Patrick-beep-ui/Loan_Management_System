import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "@/lib/axiosService";
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

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stakeholderId, setStakeholderId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || !stakeholderId.trim()) {
      setError("All fields are required.");
      return;
    }

    const stakeholderIdValue = Number(stakeholderId);
    if (!Number.isInteger(stakeholderIdValue) || stakeholderIdValue <= 0) {
      setError("Stakeholder ID must be a positive integer.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/auth/signup", {
        email,
        password,
        stakeholder_id: stakeholderIdValue,
      });

      navigate("/login", { state: { registered: true } });
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Unable to reach the server. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-xl shadow-md">
        <CardHeader className="space-y-3 px-8 pt-8">
          <CardTitle className="text-3xl">Create an account</CardTitle>
          <CardDescription>
            Register as a lender to start managing loans.
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
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stakeholderId">Stakeholder ID</Label>
              <Input
                id="stakeholderId"
                name="stakeholderId"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                required
                placeholder="1"
                value={stakeholderId}
                onChange={(event) => setStakeholderId(event.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-5 px-8 pb-8">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating account..." : "Sign up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                className="font-medium text-primary hover:underline"
                to="/login"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
