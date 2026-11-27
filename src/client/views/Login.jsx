import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/client/contexts/AuthContext";
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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const registered = location.state?.registered;
  const from = location.state?.from?.pathname || "/loans";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { data } = response;

      await login(data.token);
      navigate(from, { replace: true }); // redirection
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
    <main className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-xl shadow-md">

        <CardHeader className="space-y-3 px-8 pt-8">

          <CardTitle className="text-3xl">Sign in</CardTitle>
          
          <CardDescription>Access your loan management account.</CardDescription>

        </CardHeader>
        <form onSubmit={handleSubmit}>

          <CardContent className="space-y-6 px-8 py-6">
            {registered && (
              <p
                role="status"
                className="rounded-lg bg-secondary/20 px-3 py-2 text-sm text-foreground"
              >
                Account created. Sign in to continue.
              </p>
            )}
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-5 px-8 pb-8">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Need an account?{" "}
              <Link
                className="font-medium text-primary hover:underline"
                to="/signup"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
