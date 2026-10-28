"use client";

import { useState } from "react";

/** Copies `value` to the clipboard and briefly confirms it. */
export default function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (insecure context or denied): the address stays visible to select by hand.
    }
  }

  return (
    <button type="button" onClick={copy} className="mc__copy" aria-live="polite">
      {copied ? "Copied!" : label}
    </button>
  );
}
