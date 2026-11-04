"use client";

import { useEffect, useState } from "react";

interface Person {
  id: string;
  name: string;
  email: string;
}

interface MemberSearchProps {
  committeeId: string;
  committeeName: string;
  /** The server action that adds `userId` to `committeeId`. */
  action: (formData: FormData) => Promise<void>;
}

const DEBOUNCE_MS = 200;

/** Type a name or email, click a match to add that person. Searches on the server, so it stays fast with thousands of users. */
export default function MemberSearch({ committeeId, committeeName, action }: MemberSearchProps) {
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    const q = query.trim();
    if (!q) return; // The result list is hidden while the box is empty.
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState("loading");
      try {
        const res = await fetch(`/api/admin/people?${new URLSearchParams({ q, committee: committeeId })}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data: { people: Person[] } = await res.json();
        setPeople(data.people);
        setState("idle");
      } catch (error) {
        if (!controller.signal.aborted) setState("error");
        void error;
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, committeeId]);

  const searched = query.trim() !== "";

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={`Find someone to add to ${committeeName}`}
        placeholder="Add someone: type a name or email"
        className="input"
        autoComplete="off"
      />
      {searched && (
        <ul className="mt-1 divide-y divide-line rounded-lg border border-line" aria-live="polite">
          {state === "error" && <li className="px-2 py-1.5 text-danger">Search failed. Try again.</li>}
          {state !== "error" && people.length === 0 && <li className="px-2 py-1.5 text-muted">{state === "loading" ? "Searching…" : "No one found."}</li>}
          {people.map((p) => (
            <li key={p.id}>
              <form
                action={async (formData) => {
                  await action(formData);
                  setQuery("");
                }}
              >
                <input type="hidden" name="committeeId" value={committeeId} />
                <input type="hidden" name="userId" value={p.id} />
                <button className="flex w-full items-baseline justify-between gap-2 px-2 py-1.5 text-left hover:bg-soft">
                  <span className="min-w-0 truncate"><span className="font-medium">{p.name || "No name"}</span> <span className="text-muted">{p.email}</span></span>
                  <span className="shrink-0 text-xs font-bold text-accent-text">Add</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
