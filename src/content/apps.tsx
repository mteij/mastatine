import type { ReactNode } from "react";
import { ChartIcon, CheckIcon, ListIcon, PlusIcon } from "@/components/ui/icons";

/** One entry per MastApp. The dashboard rail and the hub tiles both render from this list. */
export interface MastApp {
  slug: string;
  name: string;
  description: string;
  href: string;
  /** Opens in a new tab (the external shop). */
  external?: boolean;
  icon: ReactNode;
  /** Pages of this app, shown in its full-screen sidebar. */
  nav?: { label: string; href: string; icon: ReactNode }[];
}

const svg = { viewBox: "0 0 24 24", width: 22, height: 22, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const Icons = {
  activities: (
    <svg {...svg}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  minutes: (
    <svg {...svg}>
      <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7" />
    </svg>
  ),
  dashboard: (
    <svg {...svg}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  quotes: (
    <svg {...svg}>
      <path d="M7 7h4v4H7zM15 7h4v4h-4z" />
      <path d="M7 11c0 3-1 4-3 5M15 11c0 3-1 4-3 5" />
    </svg>
  ),
  merch: (
    <svg {...svg}>
      <path d="M8 4 3 7l2 4 3-1v10h8V10l3 1 2-4-5-3a4 4 0 0 1-8 0z" />
    </svg>
  ),
  site: (
    <svg {...svg}>
      <path d="M3 11 12 4l9 7M5 10v10h14V10" />
    </svg>
  ),
};

export function getApps(shopUrl: string | null): MastApp[] {
  return [
    {
      slug: "activities",
      name: "Activities",
      description: "Find activities and subscribe, or organise your own.",
      href: "/mastapps/activities",
      icon: Icons.activities,
      nav: [
        { label: "Activities", href: "/mastapps/activities", icon: <ListIcon /> },
        { label: "Create activity", href: "/mastapps/activities/new", icon: <PlusIcon /> },
        { label: "Your activities", href: "/mastapps/activities/mine", icon: <CheckIcon /> },
      ],
    },
    {
      slug: "minutes",
      name: "Minutes",
      description: "Agendas, minutes and action points for committees.",
      href: "/mastapps/minutes",
      icon: Icons.minutes,
      nav: [
        { label: "Dashboard", href: "/mastapps/minutes", icon: Icons.dashboard },
        { label: "Meetings", href: "/mastapps/minutes/meetings", icon: <ListIcon /> },
        { label: "Actions", href: "/mastapps/minutes/actions", icon: <CheckIcon /> },
        { label: "New meeting", href: "/mastapps/minutes/meetings/new", icon: <PlusIcon /> },
      ],
    },
    {
      slug: "quotes",
      name: "Quotes",
      description: "Things members said, graded from 1 to 10.",
      href: "/mastapps/quotes",
      icon: Icons.quotes,
      nav: [
        { label: "All quotes", href: "/mastapps/quotes", icon: <ListIcon /> },
        { label: "Statistics", href: "/mastapps/quotes/statistics", icon: <ChartIcon /> },
        { label: "New quote", href: "/mastapps/quotes/new", icon: <PlusIcon /> },
      ],
    },
    ...(shopUrl
      ? [{ slug: "merch", name: "Merch", description: "Wear the tallest opinions in the room.", href: shopUrl, external: true, icon: Icons.merch }]
      : []),
  ];
}
