"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Markdown from "@/components/Markdown";

interface NotesFieldProps {
  id: string;
  meetingId: string;
  value: string;
  /** Read-only (locked meeting or a colleague is editing): shows the formatted text without tools. */
  readOnly: boolean;
  onChange: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}

type Edit = { text: string; start: number; end: number };

const toolClass = "grid h-7 min-w-7 place-items-center rounded px-1.5 text-sm font-bold text-muted hover:bg-soft hover:text-ink";

interface ToolButtonProps {
  label: string;
  title: string;
  onClick: () => void;
  className?: string;
}

// Tool buttons must not take focus from the text area, or the item's edit lock would be released and retaken on every click.
function ToolButton({ label, title, onClick, className = "" }: ToolButtonProps) {
  return (
    <button type="button" title={title} aria-label={title} className={`${toolClass} ${className}`} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>
      {label}
    </button>
  );
}

/** Wraps the selection (or a placeholder) in a marker pair, or removes the markers when it is already wrapped. */
function wrap(text: string, start: number, end: number, marker: string, placeholder: string): Edit {
  const selected = text.slice(start, end);
  if (selected.length >= marker.length * 2 && selected.startsWith(marker) && selected.endsWith(marker)) {
    const inner = selected.slice(marker.length, selected.length - marker.length);
    return { text: text.slice(0, start) + inner + text.slice(end), start, end: start + inner.length };
  }
  const body = selected || placeholder;
  const next = text.slice(0, start) + marker + body + marker + text.slice(end);
  return { text: next, start: start + marker.length, end: start + marker.length + body.length };
}

/** Puts a prefix on every selected line, or takes it off when all of them already have it. */
function prefixLines(text: string, start: number, end: number, prefix: (index: number) => string, pattern: RegExp): Edit {
  const from = start === 0 ? 0 : text.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = text.indexOf("\n", end);
  const to = lineEnd === -1 ? text.length : lineEnd;
  const lines = text.slice(from, to).split("\n");
  const allPrefixed = lines.every((line) => pattern.test(line));
  const next = lines.map((line, i) => (allPrefixed ? line.replace(pattern, "") : prefix(i) + line.replace(/^(#{1,6} |[-*] |\d+\. )/, ""))).join("\n");
  return { text: text.slice(0, from) + next + text.slice(to), start: from, end: from + next.length };
}

/** Notes for one agenda item: a Markdown text area with a small toolbar, a preview, and picture upload. */
export default function NotesField({ id, meetingId, value, readOnly, onChange, onFocus, onBlur }: NotesFieldProps) {
  const area = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Grow with the text, and put the cursor back after a toolbar edit.
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    if (pendingSelection.current) {
      el.setSelectionRange(pendingSelection.current.start, pendingSelection.current.end);
      pendingSelection.current = null;
    }
  });

  if (readOnly) {
    return value.trim() ? <Markdown className="text-sm">{value}</Markdown> : <p className="text-sm text-muted">No notes yet.</p>;
  }

  function apply(make: (text: string, start: number, end: number) => Edit) {
    const el = area.current;
    if (!el) return;
    const edit = make(el.value, el.selectionStart, el.selectionEnd);
    pendingSelection.current = { start: edit.start, end: edit.end };
    onChange(edit.text);
    el.focus();
  }

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/minutes/${meetingId}/image`, { method: "POST", body });
      const data: { url?: string; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) return setError(data.error ?? "Could not upload the picture.");
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/[[\]()]/g, "").trim().slice(0, 80);
      const markdown = `![${alt}](${data.url})`;
      apply((text, start, end) => {
        const before = text.slice(0, start);
        const lead = before && !before.endsWith("\n") ? "\n" : "";
        const insert = `${lead}${markdown}\n`;
        return { text: before + insert + text.slice(end), start: start + insert.length, end: start + insert.length };
      });
    } catch {
      setError("Could not upload the picture. Check your connection.");
    } finally {
      setUploading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    if (e.key === "b") {
      e.preventDefault();
      apply((t, s, en) => wrap(t, s, en, "**", "bold text"));
    } else if (e.key === "i") {
      e.preventDefault();
      apply((t, s, en) => wrap(t, s, en, "*", "italic text"));
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const picture = [...e.clipboardData.files].find((f) => f.type.startsWith("image/"));
    if (!picture) return;
    e.preventDefault();
    void upload(picture);
  }

  return (
    <div>
      <div role="toolbar" aria-label="Formatting" className="mb-1 flex flex-wrap items-center gap-0.5">
        <ToolButton label="B" title="Bold (Ctrl+B)" onClick={() => apply((t, s, e) => wrap(t, s, e, "**", "bold text"))} />
        <ToolButton label="I" title="Italic (Ctrl+I)" className="italic" onClick={() => apply((t, s, e) => wrap(t, s, e, "*", "italic text"))} />
        <ToolButton label="H" title="Heading" onClick={() => apply((t, s, e) => prefixLines(t, s, e, () => "## ", /^## /))} />
        <ToolButton label="•" title="Bulleted list" onClick={() => apply((t, s, e) => prefixLines(t, s, e, () => "- ", /^- /))} />
        <ToolButton label="1." title="Numbered list" onClick={() => apply((t, s, e) => prefixLines(t, s, e, (i) => `${i + 1}. `, /^\d+\. /))} />
        <ToolButton
          label="Link"
          title="Link"
          onClick={() =>
            apply((t, s, e) => {
              const label = t.slice(s, e) || "link text";
              const next = `${t.slice(0, s)}[${label}](https://)${t.slice(e)}`;
              const urlStart = s + label.length + 3;
              return { text: next, start: urlStart, end: urlStart + 8 };
            })
          }
        />
        <button
          type="button"
          title="Add a picture"
          aria-label="Add a picture"
          className={toolClass}
          disabled={uploading}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileInput.current?.click()}
        >
          {uploading ? "Uploading…" : "Image"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void upload(file);
          }}
        />
        <button
          type="button"
          aria-pressed={preview}
          className="ml-auto rounded px-2 py-1 text-xs font-bold text-muted hover:bg-soft hover:text-ink aria-pressed:bg-soft aria-pressed:text-ink"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setPreview((p) => !p)}
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview && (
        <div className="min-h-16 rounded-lg border border-line bg-surface px-3 py-2 text-sm">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-muted">Nothing to preview yet.</p>}
        </div>
      )}
      <textarea
        ref={area}
        id={id}
        className="input min-h-16 resize-none overflow-hidden !py-2 text-sm"
        maxLength={10000}
        hidden={preview}
        value={value}
        placeholder="Notes… (select text and use the toolbar to format)"
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
      />
      {error && <p role="alert" className="mt-1 text-xs font-bold text-danger">{error}</p>}
    </div>
  );
}
