import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import AdminTabs from "./AdminTabs";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="container-page admin-compact @container py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Admin</h1>
        <AdminTabs />
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
