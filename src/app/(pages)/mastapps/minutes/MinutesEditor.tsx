"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUTOSAVE_MS, HEARTBEAT_MS, POLL_MS, itemLabels } from "@/lib/minutes-live";
import { formatDeadline, type MeetingStatus } from "@/lib/minutes-format";
import type { LiveItem } from "@/lib/meetings";
import { acquireItemLock, addAction, releaseItemLock, saveItemNotes, setMeetingStatus } from "./actions";
import NotesField from "./NotesField";

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
    <div className="admin-compact space-y-2">
      <div className="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-line bg-surface/95 px-3 py-2 shadow-sm backdrop-blur">
        <p role="status" aria-live="polite" className={`text-sm ${saveState === "saved" || saveState === "saving" ? "text-muted" : "font-bold text-danger"}`}>
          {locked ? `Locked. ${isAdmin ? "You can reopen it." : "Only an admin can reopen it."}` : SAVE_TEXT[saveState]}
        </p>
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold" htmlFor="status">Status</label>
          <select id="status" className="input !w-auto" value={status} disabled={locked && !isAdmin} onChange={(e) => void onStatus(e.target.value as MeetingStatus)}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {items.map((item, i) => {
        const lockedByOther = item.locked_by_name !== null;
        const readOnly = lockedByOther || locked;
        const heading = `${labels[i]} ${item.title}`;
        return (
          <div key={item.id} className={`card p-3 ${item.level === 1 ? "ml-4 sm:ml-8" : ""}`}>
            <div className="mb-1 flex items-start justify-between gap-2">
              {readOnly ? (
                <h3 className="text-sm font-bold text-accent-text">{heading}</h3>
              ) : (
                <label className="text-sm font-bold text-accent-text" htmlFor={`notes-${item.id}`}>{heading}</label>
              )}
              <div className="flex shrink-0 items-center gap-2">
                {lockedByOther && <span className="badge">{item.locked_by_name} is editing…</span>}
                {!locked && addingFor !== item.id && (
                  <button type="button" className="text-xs font-bold text-muted hover:text-accent-text" onClick={() => setAddingFor(item.id)}>+ Action point</button>
                )}
              </div>
            </div>
            <NotesField
              id={`notes-${item.id}`}
              meetingId={meetingId}
              value={drafts[item.id] ?? item.notes}
              readOnly={readOnly}
              onChange={(text) => onChange(item.id, text)}
              onFocus={() => void onFocus(item.id)}
              onBlur={() => void onBlur(item.id, drafts[item.id])}
            />

            {item.actions.length > 0 && (
              <ul className="mt-2 space-y-1">
                {item.actions.map((a) => (
                  <li key={a.id} className={`rounded-md bg-soft px-2 py-1 text-xs ${a.is_done ? "line-through opacity-60" : ""}`}>
                    <strong>Action point · {a.assignee_name ?? "unassigned"}:</strong> {a.body} <span className="text-muted">({formatDeadline(a.deadline)})</span>
                  </li>
                ))}
              </ul>
            )}

            {!locked && addingFor === item.id && (
              <form onSubmit={onAddAction} className="mt-2 space-y-2 rounded-lg border border-line p-2">
                <input type="hidden" name="id" value={meetingId} />
                <input type="hidden" name="item_id" value={item.id} />
                <input name="body" aria-label="Action point" className="input" required maxLength={500} placeholder="What needs to happen?" autoFocus />
                <div className="flex flex-wrap gap-2">
                  <select name="assignee_id" aria-label="Assigned to" className="input !w-auto min-w-0 flex-1" defaultValue="">
                    <option value="">Unassigned</option>
                    {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input name="deadline" type="date" aria-label="Deadline (empty: next meeting)" className="input !w-auto" />
                  <button type="submit" className="btn btn-primary btn-sm">Add</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAddingFor(null)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
