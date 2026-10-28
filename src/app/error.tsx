"use client";

import Link from "next/link";

export default function RouteError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <div className="page-panel">
      <div className="container-prose py-24 text-center" role="alert">
        <p className="font-display text-7xl font-extrabold text-accent-text">Oops</p>
        <h1 className="mt-4 text-3xl font-extrabold">Something went wrong</h1>
        <p className="mt-3 text-muted">The mast swayed more than we planned. Please try again in a moment.</p>
        {error.digest && <p className="mt-2 text-sm text-muted">Reference: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-primary" onClick={() => unstable_retry()}>
            Try again
          </button>
          <Link href="/" className="btn btn-secondary">
            Back to the masts
          </Link>
        </div>
      </div>
    </div>
  );
}
