import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      padding: "2rem",
    }}>
      <div style={{
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "3rem 2.5rem",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}>
        <div style={{
          fontSize: "3rem",
          fontWeight: 900,
          color: "var(--orange)",
          lineHeight: 1,
          marginBottom: "0.5rem",
        }}>
          404
        </div>
        <h1 style={{
          fontSize: "1.3rem",
          fontWeight: 700,
          color: "var(--navy)",
          marginBottom: "1rem",
        }}>
          Page not found
        </h1>
        <p style={{
          color: "var(--text-mid)",
          fontSize: "1rem",
          lineHeight: 1.7,
          marginBottom: "2rem",
        }}>
          This site is only about masts. The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "var(--orange)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.95rem",
            padding: "0.65rem 1.75rem",
            borderRadius: "3px",
            textDecoration: "none",
            letterSpacing: "0.02em",
          }}
        >
          Back to the masts
        </Link>
      </div>
    </div>
  );
}
