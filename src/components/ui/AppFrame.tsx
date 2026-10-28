import type { ReactNode } from "react";

interface AppFrameProps {
  title: string;
  tagline?: string;
  children: ReactNode;
}

/** Shared page frame for every full-screen MastApp: title, tagline and a consistent width. Navigation lives in the app sidebar. */
export default function AppFrame({ title, tagline, children }: AppFrameProps) {
  return (
    <div className="dash-page">
      <header className="dash-head">
        <h1>{title}</h1>
        {tagline && <p>{tagline}</p>}
      </header>
      {children}
    </div>
  );
}
