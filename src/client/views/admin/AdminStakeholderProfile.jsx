import AdminStakeholderLoansTable from "@/components/admin/stakeholders/AdminStakeholderLoansTable";
import AdminStakeholderPersonalInfo from "@/components/admin/stakeholders/AdminStakeholderPersonalInfo";
import AdminStakeholderProfileHeader from "@/components/admin/stakeholders/AdminStakeholderProfileHeader";
import ErrorAlert from "@/components/loans/create/ErrorAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminStakeholderProfile } from "@/client/hooks/useAdminStakeholderProfile";

export default function AdminStakeholderProfile() {
  const { id, profile, loading, error, notFound, refresh, goBack } =
    useAdminStakeholderProfile();

  return (
    <Card className="mx-auto w-full max-w-6xl">
      <AdminStakeholderProfileHeader
        name={profile?.displayName || `Stakeholder #${id}`}
        stakeholderId={id}
        onBack={goBack}
      />
      <CardContent className="space-y-6">
        <ErrorAlert message={error} />
        {notFound && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-destructive/10 p-4 text-destructive"
          >
            <span>Stakeholder not found.</span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={goBack}
              >
                Back to stakeholders
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={refresh}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading stakeholder...</p>
        ) : (
          profile && (
            <div className="space-y-6">
              <AdminStakeholderPersonalInfo profile={profile} />
              <AdminStakeholderLoansTable records={profile.loanRecords} />
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
