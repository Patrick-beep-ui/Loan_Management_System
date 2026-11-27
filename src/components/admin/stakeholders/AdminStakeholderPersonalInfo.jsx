import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/client/utils/loanFormat";

function InfoItem({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

export default function AdminStakeholderPersonalInfo({ profile }) {
  const { stakeholder, access } = profile;
  const accessLabel = access
    ? [
        access.roleName,
        access.isActive ? "Active" : "Inactive",
        access.mustChangePassword ? "Password pending" : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "No linked account";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Stakeholder ID" value={stakeholder.stakeholder_id} />
          <InfoItem label="National ID" value={stakeholder.national_id || "—"} />
          <InfoItem
            label="Marital status"
            value={stakeholder.marital_status || "—"}
          />
          <InfoItem label="Occupation" value={stakeholder.occupation || "—"} />
          <InfoItem
            label="Date of birth"
            value={formatDate(stakeholder.date_of_birth)}
          />
          <InfoItem label="Access account" value={accessLabel} />
          {access && <InfoItem label="Email" value={access.email} />}
        </div>
      </CardContent>
    </Card>
  );
}
