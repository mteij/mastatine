"use client";

import { useRef, useState } from "react";

export interface AgendaDraftItem {
  level: 0 | 1;
  title: string;
}

interface Row extends AgendaDraftItem {
  key: number;
}

const MAX_ITEMS = 100;
const MAX_TITLE = 200;

const icon = { viewBox: "0 0 24 24", width: 18, height: 18, fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/** The first item can never be a sub-item, and every sub-item needs a parent above it. */
function normalise(rows: Row[]): Row[] {
  return rows.map((row, i) => (i === 0 && row.level === 1 ? { ...row, level: 0 } : row));
}

/** "1", "2", "2.1": the numbering the minutes use. */
function numbering(rows: Row[]): string[] {
  let main = 0;
  let sub = 0;
  return rows.map((row) => {
    if (row.level === 0) {
      main += 1;
      sub = 0;
      return String(main);
    }
    sub += 1;
    return `${main}.${sub}`;
  });
}

/** Same one-line-per-item text the server reads: a leading "-" marks a sub-item. */
function serialise(rows: Row[]): string {
  return rows
    .map((row) => ({ ...row, title: row.title.replace(/^[-\s]+/, "").trim() }))
    .filter((row) => row.title.length > 0)
    .map((row) => (row.level === 1 ? `- ${row.title}` : row.title))
    .join("\n");
}

interface AgendaEditorProps {
  initialItems: AgendaDraftItem[];
  /** Name of the form field the server reads. */
  name?: string;
}

/** Agenda as a list: type a title, then move, indent or remove items with buttons. No special syntax to remember. */
export default function AgendaEditor({ initialItems, name = "agenda" }: AgendaEditorProps) {
  const nextKey = useRef(initialItems.length);
  const inputs = useRef(new Map<number, HTMLInputElement>());
  const [rows, setRows] = useState<Row[]>(() => initialItems.map((item, key) => ({ ...item, key })));
  const [focusKey, setFocusKey] = useState<number | null>(null);

  const labels = numbering(rows);

  function update(mutate: (current: Row[]) => Row[]) {
    setRows((current) => normalise(mutate(current)));
  }

  function setTitle(key: number, title: string) {
    update((current) => current.map((row) => (row.key === key ? { ...row, title: title.slice(0, MAX_TITLE) } : row)));
  }

  function setLevel(key: number, level: 0 | 1) {
    update((current) => current.map((row) => (row.key === key ? { ...row, level } : row)));
  }

  function move(index: number, by: -1 | 1) {
    update((current) => {
      const target = index + by;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(key: number) {
    update((current) => current.filter((row) => row.key !== key));
  }

  /** Inserts an empty item after `index` (or at the end) and moves the cursor to it. */
  function addAfter(index: number, level: 0 | 1) {
    if (rows.length >= MAX_ITEMS) return;
    const key = nextKey.current++;
    update((current) => {
      const at = index < 0 ? current.length : index + 1;
      return [...current.slice(0, at), { key, level, title: "" }, ...current.slice(at)];
    });
    setFocusKey(key);
  }

  return (
    <div>
      <input type="hidden" name={name} value={serialise(rows)} />

      {rows.length === 0 ? (
        <p className="rounded-xl bg-soft px-4 py-3 text-sm text-muted">No items yet. Add the first one below.</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((row, index) => (
            <li key={row.key} className={`flex items-center gap-2 ${row.level === 1 ? "ml-8 sm:ml-10" : ""}`}>
              <span className="w-8 shrink-0 text-right text-sm font-bold tabular-nums text-muted">{labels[index]}</span>
              <input
                ref={(el) => {
                  if (el) {
                    inputs.current.set(row.key, el);
                    if (focusKey === row.key) {
                      el.focus();
                      setFocusKey(null);
                    }
                  } else {
                    inputs.current.delete(row.key);
                  }
                }}
                className="input min-w-0 flex-1"
                value={row.title}
                maxLength={MAX_TITLE}
                placeholder={row.level === 1 ? "Sub-item" : "Item"}
                aria-label={`Agenda item ${labels[index]}`}
                onChange={(e) => setTitle(row.key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAfter(index, row.level);
                  } else if (e.key === "Backspace" && row.title === "" && rows.length > 1) {
                    e.preventDefault();
                    remove(row.key);
                  }
                }}
              />
              <div className="flex shrink-0 items-center">
                <button type="button" className="agenda-btn" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move item ${labels[index]} up`} title="Move up">
                  <svg {...icon}><path d="m6 15 6-6 6 6" /></svg>
                </button>
                <button type="button" className="agenda-btn" onClick={() => move(index, 1)} disabled={index === rows.length - 1} aria-label={`Move item ${labels[index]} down`} title="Move down">
                  <svg {...icon}><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {row.level === 0 ? (
                  <button type="button" className="agenda-btn" onClick={() => setLevel(row.key, 1)} disabled={index === 0} aria-label={`Make item ${labels[index]} a sub-item`} title="Make sub-item">
                    <svg {...icon}><path d="M5 5v8a3 3 0 0 0 3 3h11M15 12l4 4-4 4" /></svg>
                  </button>
                ) : (
                  <button type="button" className="agenda-btn" onClick={() => setLevel(row.key, 0)} aria-label={`Make item ${labels[index]} a main item`} title="Make main item">
                    <svg {...icon}><path d="M19 5v8a3 3 0 0 1-3 3H5M9 12l-4 4 4 4" /></svg>
                  </button>
                )}
                <button type="button" className="agenda-btn agenda-btn--danger" onClick={() => remove(row.key)} aria-label={`Remove item ${labels[index]}`} title="Remove">
                  <svg {...icon}><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => addAfter(-1, 0)} disabled={rows.length >= MAX_ITEMS}>
          + Add item
        </button>
        {rows.length > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => addAfter(-1, 1)} disabled={rows.length >= MAX_ITEMS}>
            + Add sub-item
          </button>
        )}
      </div>
    </div>
  );
}
