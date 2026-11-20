import { useEffect, useState } from "react";

import { useAuth } from "@/client/contexts/AuthContext";
import api from "@/lib/axiosService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";
}

function formatRate(value) {
  if (value === null || value === undefined || value === "") return "—";

  const rate = Number(value);
  return Number.isFinite(rate)
    ? `${rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}%`
    : "—";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toISOString().slice(0, 10);
}

function fullName(stakeholder) {
  if (!stakeholder) return "—";

  return (
    [stakeholder.first_name, stakeholder.last_name].filter(Boolean).join(" ") ||
    "—"
  );
}

export default function Loan() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchLoans() {
    setError("");
    setLoading(true);

    try {
      const { data } = await api.get("/loans");
      setLoans(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Unable to load loans. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLoans();
  }, []);

  const stakeholderName = fullName(user?.Stakeholder);
  const roleName = user?.Role?.role_name;

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <Card className="mx-auto w-full max-w-6xl">
        <CardHeader>
          <CardTitle className="text-2xl">Loans</CardTitle>
          <CardDescription>
            {stakeholderName !== "—"
              ? `Loans for ${stakeholderName}${roleName ? ` (${roleName})` : ""}.`
              : "All loans available to your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div
              role="alert"
              className="mb-4 flex flex-col gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{error}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchLoans}
              >
                Retry
              </Button>
            </div>
          )}
          <Table>
            <TableCaption>Loan records</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Lender</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Disbursed</TableHead>
                <TableHead>Total to Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    Loading loans...
                  </TableCell>
                </TableRow>
              ) : loans.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    No loans found.
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.loan_id}>
                    <TableCell>{loan.loan_id}</TableCell>
                    <TableCell>{fullName(loan.lender)}</TableCell>
                    <TableCell>{fullName(loan.customer)}</TableCell>
                    <TableCell>{formatAmount(loan.loan_amount)}</TableCell>
                    <TableCell>{formatRate(loan.interest_rate)}</TableCell>
                    <TableCell>{loan.interest_payment_mode}</TableCell>
                    <TableCell>{formatDate(loan.disbursed_at)}</TableCell>
                    <TableCell>{formatAmount(loan.total_to_pay)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
