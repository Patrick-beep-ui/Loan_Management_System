import { useNavigate } from "react-router-dom";

import ErrorAlert from "@/components/loans/create/ErrorAlert";
import StakeholdersHeader from "@/components/stakeholders/StakeholdersHeader";
import StakeholdersTable from "@/components/stakeholders/StakeholdersTable";
import { Card, CardContent } from "@/components/ui/card";
import { useLenderStakeholders } from "@/client/hooks/useLenderStakeholders";

export default function Stakeholders() {
  const navigate = useNavigate();
  const { rows, loading, error, refresh } = useLenderStakeholders();

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <Card className="mx-auto w-full max-w-6xl">
        <StakeholdersHeader
          refreshing={loading}
          onRefresh={refresh}
          onBack={() => navigate("/loans")}
        />
        <CardContent className="space-y-4">
          <ErrorAlert message={error} />
          <StakeholdersTable rows={rows} loading={loading} />
        </CardContent>
      </Card>
    </main>
  );
}
