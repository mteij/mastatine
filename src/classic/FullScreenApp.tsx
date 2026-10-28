"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarAccount from "./SidebarAccount";
import { getApps } from "@/content/apps";
import { appSlug } from "@/lib/paths";

/** Full-screen shell for a single MastApp: its own sidebar (the pages of the app) and a scrolling canvas. */
export default function FullScreenApp({ shopUrl, children }: { shopUrl: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = appSlug(pathname);
  const app = getApps(shopUrl).find((a) => a.slug === slug);

  return (
    <div className="dash">
      <header className="dash-bar">
        {/* Always the way out: back to the MastApps hub from an app, back to the site from the hub itself. */}
        <Link href={app ? "/mastapps" : "/"} className="dash-back">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          <span>{app ? "MastApps" : "Back to site"}</span>
        </Link>

        {app?.nav && (
          <nav className="dash-nav" aria-label={`${app.name} pages`}>
            {app.nav.map((item) => (
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
