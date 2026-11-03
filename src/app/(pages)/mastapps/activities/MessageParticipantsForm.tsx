"use client";

import { useActionState } from "react";
import { messageParticipants, type MessageState } from "./actions";

/** Organisers write to everyone who is going. Shows how many people it reached. */
export default function MessageParticipantsForm({ id, going }: { id: string; going: number }) {
  const [state, action, pending] = useActionState<MessageState, FormData>(messageParticipants, {});

  return (
    <details className="card p-4">
      <summary className="cursor-pointer font-bold">Message the {going} {going === 1 ? "participant" : "participants"}</summary>
      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={id} />
        <input name="subject" className="input" placeholder="Subject" aria-label="Subject" maxLength={100} required />
        <textarea name="body" className="input min-h-28" placeholder="What do the participants need to know?" aria-label="Message" maxLength={2000} required />
        <p className="text-sm text-muted">Sent by email to everyone who is going, with your name and committee. Up to 3 messages per activity per day.</p>
        {state.error && <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</p>}
        {state.sent !== undefined && <p role="status" className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">Sent to {state.sent} {state.sent === 1 ? "person" : "people"}.</p>}
        <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
      </form>
    </details>
  );
}
