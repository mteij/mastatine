"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "mastatine_dismissed_announcement";
const CHANGE_EVENT = "mastatine:announcement-dismissed";
const HEIGHT_VAR = "--announce-h";

interface AnnouncementBarProps {
  slug: string;
  title: string;
  summary: string;
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

/**
 * Sticky strip at the top of every site page announcing the latest news. Closing it is remembered per news item
 * (a per-visitor convenience, not tracking), so the next post is announced again. While visible it publishes its
 * height as --announce-h so the sticky sidebar can sit below it.
 */
export default function AnnouncementBar({ slug, title, summary }: AnnouncementBarProps) {
  const dismissed = useSyncExternalStore(subscribe, () => readDismissed() === slug, () => false);
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
      localStorage.setItem(STORAGE_KEY, slug);
    } catch {
      // storage blocked: still hide it for this page view below
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <aside ref={ref} className="announce" aria-label="Latest news">
      <Link href={`/news/${slug}`} className="announce__link">
        <span className="announce__tag">
          <span className="announce__pulse" aria-hidden />
          New
        </span>
        <span className="announce__title">{title}</span>
        <span className="announce__summary">{summary}</span>
        <span className="announce__more" aria-hidden>Read more &rarr;</span>
      </Link>
      <button type="button" className="announce__close" onClick={dismiss} aria-label="Dismiss announcement">
        &times;
      </button>
    </aside>
  );
}
