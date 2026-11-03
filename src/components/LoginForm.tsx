"use client";

import { useEffect, useId, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Status = "idle" | "sending" | "sent";

/**
 * After the link is opened, everyone passes the welcome page, which asks the newsletter question once.
 * New accounts choose a display name first, then continue to the welcome page.
 */
function destinations(next: string) {
  const welcome = `/welcome?next=${encodeURIComponent(next)}`;
  return { existing: welcome, created: `/account/name?next=${encodeURIComponent(welcome)}` };
}

export default function LoginForm({ next }: { next: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // The link often opens in a new tab: once it signs the visitor in, move this tab along too.
  useEffect(() => {
    if (status !== "sent") return;
    const timer = window.setInterval(async () => {
      const { data } = await authClient.getSession();
      if (data) window.location.assign(destinations(next).existing);
    }, 3000);
    const stop = window.setTimeout(() => window.clearInterval(timer), 10 * 60 * 1000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [status, next]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    const target = destinations(next);
    const { error: authError } = await authClient.signIn.magicLink({
      email: email.trim().toLowerCase(),
      callbackURL: target.existing,
      newUserCallbackURL: target.created,
    });
    if (authError) {
      setStatus("idle");
      setError(authError.status === 429 ? "Too many attempts. Please wait a minute and try again." : "We could not send a link right now. Please try again.");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div role="status" className="space-y-3">
        <p className="text-lg font-semibold">Check your inbox</p>
        <p className="text-muted">
          If <strong className="text-ink">{email}</strong> can sign in, we have sent a link to it. It works once and expires in 10 minutes.
          Nothing there? Check your spam folder.
        </p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStatus("idle")}>
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor={`${id}-email`} className="label">Email address</label>
        <input id={`${id}-email`} type="email" required autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={status === "sending" || !email} className="btn btn-primary w-full py-3">
        {status === "sending" ? "Sending link…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
