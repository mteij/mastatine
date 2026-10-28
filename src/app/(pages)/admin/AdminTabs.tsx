"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/masts", label: "Masts" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/committees", label: "Committees" },
  { href: "/admin/newsletter", label: "Newsletter" },
];

/** The Overview tab is only current on /admin itself; every other tab also covers its sub-pages. */
function isCurrent(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1">
      {TABS.map((tab) => {
        const current = isCurrent(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              current ? "bg-accent text-accent-fg hover:text-accent-fg" : "text-muted hover:bg-soft hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
