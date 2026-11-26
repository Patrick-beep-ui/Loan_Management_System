import { Outlet } from "react-router-dom";

import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-6 font-heading text-3xl text-foreground">
          Administration
        </h1>
        <AdminNav />
        <Outlet />
      </div>
    </main>
  );
}
