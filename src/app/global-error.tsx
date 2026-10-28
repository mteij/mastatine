"use client";

// Replaces the root layout when it fails, so it brings its own <html>, <body> and (inline) styles.
export default function GlobalError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fff", color: "#0a0a0a" }}>
        <main role="alert" style={{ maxWidth: "36rem", margin: "0 auto", padding: "6rem 1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem" }}>Something went wrong</h1>
          <p style={{ color: "#555" }}>The site hit an unexpected error. Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", border: 0, borderRadius: "0.6rem", background: "#d96810", color: "#fff", fontWeight: 700, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
