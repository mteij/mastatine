"use client";

import { useId, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Status = "idle" | "sending" | "sent";

export default function LoginForm({ next }: { next: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    const { error: authError } = await authClient.signIn.magicLink({
      email: email.trim().toLowerCase(),
      callbackURL: next,
      newUserCallbackURL: next,
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
        <input id={`${id}-email`} type="email" required autoComplete="email" autoFocus maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={status === "sending" || !email} className="btn btn-primary w-full py-3">
        {status === "sending" ? "Sending link…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
