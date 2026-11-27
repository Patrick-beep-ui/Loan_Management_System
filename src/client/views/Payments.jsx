import { useNavigate } from "react-router-dom";

import ErrorAlert from "@/components/loans/create/ErrorAlert";
import PaymentsHeader from "@/components/payments/PaymentsHeader";
import PaymentsTable from "@/components/payments/PaymentsTable";
import { Card, CardContent } from "@/components/ui/card";
import { usePaymentsOverview } from "@/client/hooks/usePaymentsOverview";

export default function Payments() {
  const navigate = useNavigate();
  const { payments, loading, error, refresh } = usePaymentsOverview();

  return (
    <main className="min-h-screen bg-background px-4 pt-4 pb-10">
      <Card className="mx-auto w-full max-w-6xl">
        <PaymentsHeader
          refreshing={loading}
          onRefresh={refresh}
          onBack={() => navigate("/loans")}
        />
        <CardContent className="space-y-4">
          <ErrorAlert message={error} />
          <PaymentsTable payments={payments} loading={loading} />
        </CardContent>
      </Card>
    </main>
  );
}
