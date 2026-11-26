import { Card, CardContent } from "@/components/ui/card";
import AdminDashboardAlerts from "@/components/admin/dashboard/AdminDashboardAlerts";
import AdminDashboardCards from "@/components/admin/dashboard/AdminDashboardCards";
import AdminDashboardHeader from "@/components/admin/dashboard/AdminDashboardHeader";
import AdminDashboardPaymentTrend from "@/components/admin/dashboard/AdminDashboardPaymentTrend";
import AdminDashboardRecentPayments from "@/components/admin/dashboard/AdminDashboardRecentPayments";
import AdminDashboardStatus from "@/components/admin/dashboard/AdminDashboardStatus";
import { useAdminDashboard } from "@/client/hooks/useAdminDashboard";

export default function AdminDashboard() {
  const { metrics, monthlyPayments, recentPayments, loading, error, refresh } =
    useAdminDashboard();

  return (
    <Card className="mx-auto w-full max-w-6xl">
      <AdminDashboardHeader loading={loading} onRefresh={refresh} />
      <CardContent className="space-y-6">
        <AdminDashboardAlerts error={error} />

        {loading ? (
          <p className="text-muted-foreground">Loading dashboard...</p>
        ) : (
          <>
            <AdminDashboardCards metrics={metrics} />
            <div className="grid gap-6 lg:grid-cols-2">
              <AdminDashboardStatus metrics={metrics} />
              <AdminDashboardPaymentTrend payments={monthlyPayments} />
            </div>
            <AdminDashboardRecentPayments payments={recentPayments} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
