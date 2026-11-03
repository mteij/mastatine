import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="dash-page admin-compact @container">
      <h1 className="sr-only">Admin</h1>
      {children}
    </div>
  );
}
