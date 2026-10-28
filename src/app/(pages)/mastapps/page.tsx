import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { getApps, type MastApp } from "@/content/apps";
import { getShopUrl } from "@/lib/shop";

export const metadata: Metadata = {
  title: "MastApps",
  description: "Small apps for mast enthusiasts.",
};

function Arrow({ external }: { external?: boolean }) {
  return (
    <svg className="app-tile__arrow" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {external ? <path d="M7 17 17 7M8 7h9v9" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  );
}

function Tile({ app }: { app: MastApp }) {
  const content = (
    <>
      <span className="app-tile__icon">{app.icon}</span>
      <h2 className="app-tile__name">{app.name}</h2>
      <p className="app-tile__text">{app.description}</p>
      <Arrow external={app.external} />
    </>
  );
  if (app.external) {
    return (
      <a href={app.href} target="_blank" rel="noopener noreferrer" className="app-tile">
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={app.href} className="app-tile">
      {content}
    </Link>
  );
}

export default function MastAppsPage() {
  const apps = getApps(getShopUrl());

  return (
    <>
      <PageHeader title="MastApps" intro="Small apps for mast enthusiasts." />
      <div className="container-page">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <li key={app.slug}>
              <Tile app={app} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
