"use client";

import { useActionState } from "react";
import { saveDisplayName, type DisplayNameState } from "../actions";
import { NAME_MAX } from "@/lib/profile";

interface DisplayNameFormProps {
  initialName: string;
  next: string;
}

export default function DisplayNameForm({ initialName, next }: DisplayNameFormProps) {
  const [state, action, pending] = useActionState<DisplayNameState, FormData>(saveDisplayName, {});

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="display-name" className="label">Display name</label>
        <input
          id="display-name"
          name="name"
          className="input"
          defaultValue={initialName}
          maxLength={NAME_MAX}
          autoComplete="name"
          autoCapitalize="words"
          required
          aria-describedby="display-name-hint"
        />
        <p id="display-name-hint" className="hint">Your first name or a nickname is fine. Your email address is never shown to other people.</p>
      </div>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <button type="submit" className="btn btn-primary w-full py-3" disabled={pending}>{pending ? "Saving…" : "Continue"}</button>
    </form>
  );
}
