import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/masts", label: "Masts" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/committees", label: "Committees" },
  { href: "/admin/newsletter", label: "Newsletter" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Admin</h1>
        <nav aria-label="Admin" className="flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1">
          {TABS.map((tab) => (
            <Link key={tab.href} href={tab.href} className="rounded-full px-4 py-1.5 text-sm font-medium text-muted hover:bg-soft hover:text-ink">
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
