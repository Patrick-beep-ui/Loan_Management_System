import ErrorAlert from "@/components/loans/create/ErrorAlert";
import StakeholdersHeader from "@/components/stakeholders/StakeholdersHeader";
import StakeholdersTable from "@/components/stakeholders/StakeholdersTable";
import { Card, CardContent } from "@/components/ui/card";
import { useLenderStakeholders } from "@/client/hooks/useLenderStakeholders";

export default function Stakeholders() {
  const { rows, loading, error, refresh } = useLenderStakeholders();

  return (
    <Card className="mx-auto w-full max-w-6xl">
      <StakeholdersHeader
        refreshing={loading}
        onRefresh={refresh}
      />
      <CardContent className="space-y-4">
        <ErrorAlert message={error} />
        <StakeholdersTable rows={rows} loading={loading} />
      </CardContent>
    </Card>
  );
}
