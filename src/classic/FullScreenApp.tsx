"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarAccount from "./SidebarAccount";
import { authClient } from "@/lib/auth-client";
import { getApps } from "@/content/apps";
import { ADMIN_NAV, isAdminTabCurrent } from "@/content/admin-nav";
import { appSlug, isAdminPath } from "@/lib/paths";

/** Full-screen shell for a single MastApp or the admin area: a slim header with the pages, and a scrolling canvas. */
export default function FullScreenApp({ shopUrl, children }: { shopUrl: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const slug = appSlug(pathname);
  const app = getApps(shopUrl).find((a) => a.slug === slug);
  const admin = isAdminPath(pathname);

  return (
    <div className={admin ? "dash dash--admin" : "dash"}>
      <header className="dash-bar">
        {/* Always the way out: back to the MastApps hub from an app, back to the site from the hub itself. */}
        <Link href={app || admin ? "/mastapps" : "/"} className="dash-back">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          <span>{app || admin ? "MastApps" : "Back to site"}</span>
        </Link>

        {admin && <span className="dash-title">Admin</span>}

        {admin && (
          <nav className="dash-nav" aria-label="Admin pages">
            {ADMIN_NAV.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isAdminTabCurrent(pathname, item.href) ? "page" : undefined}>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        )}

        {app?.nav && (
          <nav className="dash-nav" aria-label={`${app.name} pages`}>
            {app.nav.filter((item) => session || !item.needsLogin).map((item) => (
              <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        )}

        <div className="dash-foot">
          <SidebarAccount />
        </div>
      </header>

      <main id="main" className="dash-main">
        {children}
      </main>
    </div>
  );
}
