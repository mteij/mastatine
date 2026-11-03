"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "mastatine_dismissed_announcement";
const CHANGE_EVENT = "mastatine:announcement-dismissed";
const HEIGHT_VAR = "--announce-h";

interface AnnouncementBarProps {
  /** Changes whenever the message does; a dismissed bar returns when it does. */
  id: string;
  title: string;
  summary: string;
  /** An internal path, an http(s) address, or nothing for a plain message. */
  href: string | null;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readDismissed(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked: the bar simply comes back on every visit
  }
}

function Wrapper({ href, className, children }: { href: string | null; className: string; children: React.ReactNode }) {
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith("/")) return <Link href={href} className={className}>{children}</Link>;
  return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}</a>;
}

/**
 * Sticky strip at the top of every site page; admins choose what it says (the latest news by default). Closing it is remembered per news item
 * (a per-visitor convenience, not tracking), so a changed message is announced again. While visible it publishes its
 * height as --announce-h so the sticky sidebar can sit below it.
 */
export default function AnnouncementBar({ id, title, summary, href }: AnnouncementBarProps) {
  const dismissed = useSyncExternalStore(subscribe, () => readDismissed() === id, () => false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (dismissed || !el) {
      root.style.setProperty(HEIGHT_VAR, "0px");
      return;
    }
    const publish = () => root.style.setProperty(HEIGHT_VAR, `${el.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.setProperty(HEIGHT_VAR, "0px");
    };
  }, [dismissed]);

  if (dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // storage blocked: still hide it for this page view below
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <aside ref={ref} className="announce" aria-label="Latest news">
      <Wrapper href={href} className="announce__link">
        <span className="announce__tag">
          <span className="announce__pulse" aria-hidden />
          New
        </span>
        <span className="announce__title">{title}</span>
        {summary && <span className="announce__summary">{summary}</span>}
        {href && <span className="announce__more" aria-hidden>Read more &rarr;</span>}
      </Wrapper>
      <button type="button" className="announce__close" onClick={dismiss} aria-label="Dismiss announcement">
        &times;
      </button>
    </aside>
  );
}
