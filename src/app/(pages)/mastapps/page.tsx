import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { SHOP_URL } from "@/lib/shop";

export const metadata: Metadata = {
  title: "MastApps",
  description: "Small games and tools for mast enthusiasts: the Mast Builder, the KLOK converter and more.",
};

interface App {
  name: string;
  description: string;
  href: string;
  external?: boolean;
  icon: React.ReactNode;
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const APPS: App[] = [
  {
    name: "Mast Builder",
    description: "Stack segments and survive the storms.",
    href: "/mastapps/mast-builder",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" {...stroke} aria-hidden>
        <path d="M12 3v18M8 21h8M9 8h6M7.5 14h9" />
      </svg>
    ),
  },
  {
    name: "KLOK Converter",
    description: "Turn metres into our own unit of height.",
    href: "/mastapps/klok",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" {...stroke} aria-hidden>
        <path d="M4 17 17 4l3 3L7 20zM8 13l2 2M11 10l2 2M14 7l2 2" />
      </svg>
    ),
  },
  {
    name: "Leaderboard",
    description: "See which masts are rated highest.",
    href: "/#towers",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" {...stroke} aria-hidden>
        <path d="M8 21V10M16 21V4M12 21v-7M4 21h16" />
      </svg>
    ),
  },
  {
    name: "Merch",
    description: "Wear the tallest opinions in the room.",
    href: SHOP_URL ?? "",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" {...stroke} aria-hidden>
        <path d="M8 4 3 7l2 4 3-1v10h8V10l3 1 2-4-5-3a4 4 0 0 1-8 0z" />
      </svg>
    ),
  },
  {
    name: "Newsletter",
    description: "The best masts and news, four times a year.",
    href: "/newsletter",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" {...stroke} aria-hidden>
        <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
      </svg>
    ),
  },
];

function Arrow({ external }: { external?: boolean }) {
  return (
    <svg className="app-tile__arrow" viewBox="0 0 24 24" width="22" height="22" {...stroke} aria-hidden>
      {external ? <path d="M7 17 17 7M8 7h9v9" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  );
}

function Tile({ app }: { app: App }) {
  const content = (
    <>
      <span className="app-tile__icon">{app.icon}</span>
      <h2 className="app-tile__name">{app.name}</h2>
      <p className="app-tile__text">{app.description}</p>
      <Arrow external={app.external} />
    </>
  );

  return app.external ? (
    <a href={app.href} target="_blank" rel="noopener noreferrer" className="app-tile">
      {content}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link href={app.href} className="app-tile">
      {content}
    </Link>
  );
}

export default function MastAppsPage() {
  return (
    <>
      <PageHeader title="MastApps" intro="Small games and tools for mast enthusiasts." />
      <div className="container-page">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.filter((app) => app.href).map((app) => (
            <li key={app.name}>
              <Tile app={app} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
