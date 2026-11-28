import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { formatAmount } from "@/client/utils/loanFormat";

function RoleCard({ label, value, hint }) {
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

export default function AdminStakeholderLoanRoles({ profile }) {
  return (
    <section className="space-y-3">
      <h3 className="font-medium">Loan participation</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RoleCard label="Associated loans" value={profile.loanCount} />
        <RoleCard label="As lender" value={profile.roleCounts.lender} />
        <RoleCard label="As customer" value={profile.roleCounts.customer} />
        <RoleCard label="As guarantor" value={profile.roleCounts.guarantor} />
      </div>
      <p className="text-xs text-muted-foreground">
        Scheduled across associated loans: {formatAmount(profile.totalToPay)}
      </p>
    </section>
  );
}
