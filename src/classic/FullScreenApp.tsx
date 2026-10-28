"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarAccount from "./SidebarAccount";
import { Icons, getApps } from "@/content/apps";
import { appSlug } from "@/lib/paths";

/** Full-screen shell for a single MastApp: its own sidebar (the pages of the app) and a scrolling canvas. */
export default function FullScreenApp({ shopUrl, children }: { shopUrl: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = appSlug(pathname);
  const app = getApps(shopUrl).find((a) => a.slug === slug);

  return (
    <div className="dash">
      <aside className="dash-rail">
        <Link href={app?.href ?? "/mastapps"} className="dash-brand" aria-label={app ? `${app.name} home` : "MastApps"}>
          <span className="dash-brand__icon">{app?.icon ?? Icons.dashboard}</span>
          <span>{app?.name ?? "MastApps"}</span>
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
          <Link href="/mastapps">
            {Icons.dashboard}
            <span>All MastApps</span>
          </Link>
          <Link href="/">
            {Icons.site}
            <span>Back to site</span>
          </Link>
          <SidebarAccount />
        </div>
      </aside>

      <main id="main" className="dash-main">
        {children}
      </main>
    </div>
  );
}
