import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatAmount } from "@/client/utils/loanFormat";

function MetricCard({ label, value, hint }) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <p className="text-2xl font-semibold tabular-nums text-foreground">
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardCards({ metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard label="Loans" value={metrics.loanCount} hint="Total loans" />
      <MetricCard
        label="Loan principal"
        value={formatAmount(metrics.totalLoanAmount)}
      />
      <MetricCard
        label="Total scheduled"
        value={formatAmount(metrics.totalToPay)}
        hint="Principal plus interest"
      />
      <MetricCard
        label="Collected"
        value={formatAmount(metrics.paidAmount)}
        hint={`${metrics.paymentCount} payments recorded`}
      />
      <MetricCard
        label="Outstanding"
        value={formatAmount(metrics.outstandingAmount)}
        hint="Scheduled minus collected"
      />
      <MetricCard
        label="Overdue installments"
        value={metrics.overdueInstallmentCount}
        hint={`${metrics.pendingInstallmentCount} installments pending`}
      />
    </div>
  );
}
