import ErrorAlert from "@/components/loans/create/ErrorAlert";

export default function AdminDashboardAlerts({ error }) {
  return <ErrorAlert message={error} />;
}
