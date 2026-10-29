"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUTOSAVE_MS, HEARTBEAT_MS, POLL_MS, itemLabels } from "@/lib/minutes-live";
import { formatDeadline, type MeetingStatus } from "@/lib/minutes-format";
import type { LiveItem } from "@/lib/meetings";
import { acquireItemLock, addAction, releaseItemLock, saveItemNotes, setMeetingStatus } from "./actions";

interface MinutesEditorProps {
  meetingId: string;
  initialItems: LiveItem[];
  initialStatus: MeetingStatus;
  isAdmin: boolean;
  /** Committee members an action point can be given to. */
  people: { id: string; name: string }[];
}

type SaveState = "saved" | "saving" | "rejected" | "error";

const STATUSES: { value: MeetingStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "done", label: "Done" },
  { value: "locked", label: "Locked (read-only)" },
];

const SAVE_TEXT: Record<SaveState, string> = {
  saved: "All changes saved",
  saving: "Saving…",
  rejected: "A colleague is editing that item, so your last change was not saved.",
  error: "Could not save. Check your connection; your text is still here.",
};

/**
 * Minutes with autosave. Focusing an item takes a short lock that is renewed while you stay in it; colleagues see the item
 * disabled with your name. The server enforces the lock, so a stale tab can never overwrite someone else's text.
 */
export default function MinutesEditor({ meetingId, initialItems, initialStatus, isAdmin, people }: MinutesEditorProps) {
  const [items, setItems] = useState(initialItems);
  const [status, setStatus] = useState(initialStatus);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  // Pull in colleagues' changes, lock states and new action points. Fields with unsaved local text keep showing it.
  const reload = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const res = await fetch(`/api/minutes/${meetingId}/live`, { cache: "no-store", signal });
        if (!res.ok) return;
        const data: { status: MeetingStatus; items: LiveItem[] } = await res.json();
        setItems(data.items);
        setStatus(data.status);
      } catch {
        // Offline or navigating away: the next tick tries again.
      }
    },
    [meetingId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void reload(controller.signal);
    }, POLL_MS);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [reload]);

  // Keep the lock alive while the cursor is in an item.
  useEffect(() => {
    if (!activeId) return;
    const timer = setInterval(() => void acquireItemLock(activeId).catch(() => {}), HEARTBEAT_MS);
    return () => clearInterval(timer);
  }, [activeId]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  async function flush(id: string, text: string) {
    setSaveState("saving");
    try {
      const ok = await saveItemNotes(id, text);
      setSaveState(ok ? "saved" : "rejected");
      // Keep the draft when rejected so nothing typed is lost; drop it once saved and unchanged.
      if (ok) {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, notes: text } : item)));
        setDrafts((d) => (d[id] === text ? Object.fromEntries(Object.entries(d).filter(([k]) => k !== id)) : d));
      }
    } catch {
      setSaveState("error");
    }
  }

  function onChange(id: string, text: string) {
    setDrafts((d) => ({ ...d, [id]: text }));
    clearTimeout(timers.current.get(id));
    timers.current.set(id, setTimeout(() => void flush(id, text), AUTOSAVE_MS));
  }

  async function onFocus(id: string) {
    setActiveId(id);
    try {
      if (!(await acquireItemLock(id))) setSaveState("rejected");
    } catch {
      setSaveState("error");
    }
  }

  async function onBlur(id: string, text: string | undefined) {
    clearTimeout(timers.current.get(id));
    setActiveId((current) => (current === id ? null : current));
    if (text !== undefined) await flush(id, text);
    await releaseItemLock(id).catch(() => {});
  }

  async function onAddAction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await addAction(new FormData(event.currentTarget));
      setAddingFor(null);
      await reload();
    } catch {
      setSaveState("error");
    }
  }

  async function onStatus(next: MeetingStatus) {
    const previous = status;
    setStatus(next);
    try {
      await setMeetingStatus(meetingId, next);
    } catch {
      setStatus(previous);
      setSaveState("error");
    }
  }

  const labels = itemLabels(items);
  const locked = status === "locked";

  return (
    <div className="space-y-5">
      {locked && (
        <p role="status" className="rounded-xl bg-soft px-4 py-3 text-sm font-bold">
          This meeting is locked. {isAdmin ? "You can reopen it below." : "Only an admin can reopen it."}
        </p>
      )}
      <p role="status" aria-live="polite" className={`text-sm ${saveState === "saved" || saveState === "saving" ? "text-muted" : "font-bold text-danger"}`}>
        {SAVE_TEXT[saveState]}
      </p>

      {items.map((item, i) => {
        const lockedByOther = item.locked_by_name !== null;
        const readOnly = lockedByOther || locked;
        return (
          <div key={item.id} className={`card p-5 ${item.level === 1 ? "ml-6 sm:ml-10" : ""}`}>
            <label className="label font-bold text-accent-text" htmlFor={`notes-${item.id}`}>
              {labels[i]} {item.title}
              {lockedByOther && <span className="badge ml-2">{item.locked_by_name} is editing…</span>}
            </label>
            <textarea
              id={`notes-${item.id}`}
              className="input min-h-24"
              maxLength={10000}
              disabled={readOnly}
              value={drafts[item.id] ?? item.notes}
              onChange={(e) => onChange(item.id, e.target.value)}
              onFocus={() => void onFocus(item.id)}
              onBlur={() => void onBlur(item.id, drafts[item.id])}
            />

            {item.actions.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {item.actions.map((a) => (
                  <li key={a.id} className={`rounded-lg bg-soft px-3 py-2 text-sm ${a.is_done ? "line-through opacity-60" : ""}`}>
                    <strong>Action point · {a.assignee_name ?? "unassigned"}:</strong> {a.body} <span className="text-muted">({formatDeadline(a.deadline)})</span>
                  </li>
                ))}
              </ul>
            )}

            {!locked && (addingFor === item.id ? (
              <form onSubmit={onAddAction} className="mt-3 space-y-2 rounded-xl border border-line p-3">
                <input type="hidden" name="id" value={meetingId} />
                <input type="hidden" name="item_id" value={item.id} />
                <textarea name="body" aria-label="Action point" className="input" required maxLength={500} placeholder="What needs to happen?" autoFocus />
                <div className="flex flex-wrap gap-2">
                  <select name="assignee_id" aria-label="Assigned to" className="input !w-auto min-w-0 flex-1" defaultValue="">
                    <option value="">Unassigned</option>
                    {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input name="deadline" type="date" aria-label="Deadline (empty: next meeting)" className="input !w-auto" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">Add action point</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAddingFor(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => setAddingFor(item.id)}>+ Action point</button>
            ))}
          </div>
        );
      })}

      <div className="card flex flex-wrap items-center gap-4 p-5">
        <label className="font-bold" htmlFor="status">Meeting status</label>
        <select id="status" className="input !w-auto" value={status} disabled={locked && !isAdmin} onChange={(e) => void onStatus(e.target.value as MeetingStatus)}>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
    </div>
  );
}
