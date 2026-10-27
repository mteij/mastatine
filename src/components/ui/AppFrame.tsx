import Link from "next/link";

interface AppFrameProps {
  title: string;
  tagline: string;
  children: React.ReactNode;
}

/** Shared frame for every MastApp: back link, title and a consistent content width. */
export default function AppFrame({ title, tagline, children }: AppFrameProps) {
  return (
    <div className="container-prose py-12 sm:py-16">
      <Link href="/mastapps" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M9 2 4 7l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All MastApps
      </Link>
      <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">{title}</h1>
      <p className="mt-3 text-lg text-muted">{tagline}</p>
      <div className="mt-10">{children}</div>
    </div>
  );
}
