import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import AdminTabs from "./AdminTabs";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="container-page @container py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Admin</h1>
        <AdminTabs />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
