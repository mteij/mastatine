import type { ReactNode } from "react";

interface AppFrameProps {
  title: string;
  tagline?: ReactNode;
  /** The app's tab bar already names this page: keep the heading for screen readers only and show no visible title. */
  hideTitle?: boolean;
  /** Small controls shown beside the title (in a slim row of their own when the title is hidden). */
  actions?: ReactNode;
  children: ReactNode;
}

/** Shared page frame for every full-screen MastApp: title, tagline and a consistent width. Navigation lives in the app header. */
export default function AppFrame({ title, tagline, hideTitle, actions, children }: AppFrameProps) {
  return (
    <div className="dash-page">
      {hideTitle ? (
        <>
          <h1 className="sr-only">{title}</h1>
          {actions && <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2">{actions}</div>}
        </>
      ) : (
        <header className="dash-head flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h1>{title}</h1>
            {tagline && <p>{tagline}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </div>
  );
}
