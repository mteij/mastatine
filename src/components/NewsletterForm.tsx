"use client";

import { useId, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

interface NewsletterFormProps {
  /** Stacked layout for cards; inline for banners. */
  layout?: "inline" | "stacked";
  /** Hides the footnote under the field (used where space is tight). */
  compact?: boolean;
}

export default function NewsletterForm({ layout = "inline", compact = false }: NewsletterFormProps) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setMessage(data.message ?? "Check your inbox to confirm your subscription.");
      setStatus("sent");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p role="status" className="rounded-2xl bg-accent-soft px-5 py-4 text-sm font-medium text-accent-text">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={layout === "inline" ? "flex flex-col gap-3 sm:flex-row" : "space-y-3"}>
        <div className="flex-1">
          <label htmlFor={`${id}-email`} className="sr-only">
            Email address
          </label>
          <input
            id={`${id}-email`}
            type="email"
            required
            autoComplete="email"
            maxLength={254}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input !rounded-full"
          />
        </div>
        <div className="absolute -left-[9999px]" aria-hidden>
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>
        <button type="submit" disabled={status === "sending"} className="btn btn-primary">
          {status === "sending" ? "Sending…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {message}
        </p>
      )}
      {!compact && <p className="hint">About four emails a year. Unsubscribe in one click.</p>}
    </form>
  );
}
