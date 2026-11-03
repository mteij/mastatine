import Link from "next/link";
import type { MastApp } from "@/content/apps";

function Arrow({ external }: { external?: boolean }) {
  return (
    <svg className="app-tile__arrow" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {external ? <path d="M7 17 17 7M8 7h9v9" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  );
}

export default function AppTile({ app }: { app: MastApp }) {
  const content = (
    <>
      <span className="app-tile__icon">{app.icon}</span>
      <span className="app-tile__body">
        <span className="app-tile__head">
          <h2 className="app-tile__name">{app.name}</h2>
          {app.access && <span className="badge">{app.access} only</span>}
        </span>
        <span className="app-tile__text">{app.description}</span>
      </span>
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
