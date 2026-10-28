"use client";

import { useActionState } from "react";
import { addQuote, type QuoteFormState } from "./actions";

export default function QuoteForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState<QuoteFormState, FormData>(addQuote, {});

  return (
    <form action={action} className="card space-y-5 p-6 sm:p-8">
      <div>
        <label className="label" htmlFor="body">Quote</label>
        <textarea id="body" name="body" className="input min-h-32" required minLength={3} maxLength={1000} placeholder="Reality is a burden" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="author">Said by</label>
          <input id="author" name="author" className="input" required maxLength={80} />
        </div>
        <div>
          <label className="label" htmlFor="said_on">Date</label>
          <input id="said_on" name="said_on" type="date" className="input" required defaultValue={today} max={today} />
        </div>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state.error && <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</p>}
      <p className="text-sm text-muted">
        The quote and the name of the person who said it are shown publicly. Keep it friendly, and remove it if they ask. See the{" "}
        <a href="/privacy" className="underline">privacy page</a> and <a href="/terms" className="underline">site rules</a>.
      </p>
      <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Adding…" : "Add quote"}</button>
    </form>
  );
}
