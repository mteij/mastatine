"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { authClient } from "@/lib/auth-client";

const RETURNING_KEY = "mastatine:returning";

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readReturning(): boolean {
  try {
    return localStorage.getItem(RETURNING_KEY) === "1";
  } catch {
    return false; // storage blocked: treat everyone as new
  }
}

type Status = "idle" | "sending" | "sent";

export default function LoginForm({ next }: { next: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const returning = useSyncExternalStore(subscribeToStorage, readReturning, () => false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    const { error: authError } = await authClient.signIn.magicLink({
      email: email.trim().toLowerCase(),
      callbackURL: next,
      newUserCallbackURL: next,
      metadata: { newsletter: returning ? false : newsletter },
    });
    if (authError) {
      setStatus("idle");
      setError(authError.status === 429 ? "Too many attempts. Please wait a minute and try again." : "We could not send a link right now. Please try again.");
      return;
    }
    try {
      localStorage.setItem(RETURNING_KEY, "1");
    } catch {}
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
      {!returning && (
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
          <span>
            Also send me the newsletter <span className="text-muted">(about 4 a year, only for new accounts)</span>
          </span>
        </label>
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={status === "sending" || !email} className="btn btn-primary w-full py-3">
        {status === "sending" ? "Sending link…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
