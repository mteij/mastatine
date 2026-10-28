import type { ReactNode } from "react";

interface AppFrameProps {
  title: string;
  tagline?: string;
  /** Small controls shown beside the title (below it on narrow screens). */
  actions?: ReactNode;
  children: ReactNode;
}

/** Shared page frame for every full-screen MastApp: title, tagline and a consistent width. Navigation lives in the app sidebar. */
export default function AppFrame({ title, tagline, actions, children }: AppFrameProps) {
  return (
    <div className="dash-page">
      <header className="dash-head flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1>{title}</h1>
          {tagline && <p>{tagline}</p>}
        </div>
        {actions}
      </header>
      {children}
    </div>
  );
}
