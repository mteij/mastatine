"use client";

import { useEffect, useState } from "react";

const nowSeconds = () => Math.floor(Date.now() / 1000);

/** "in 3d 4h", "in 2h 15m", "in 5m 10s" or "now", counting down live in the browser. */
export function formatCountdown(secondsLeft: number): string {
  const d = Math.floor(secondsLeft / 86400);
  const h = Math.floor((secondsLeft % 86400) / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  if (d > 0) return `in ${d}d ${h}h`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m ${s}s`;
}

interface ActivityCountdownProps {
  startsAt: string;
  endsAt: string | null;
  /** Shown until the browser has taken over (and as the text for screen readers on the server render). */
  fallback: string;
}

export default function ActivityCountdown({ startsAt, endsAt, fallback }: ActivityCountdownProps) {
  // null until mounted, so the server render and first client render match and never mismatch on the clock.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(nowSeconds());
    const timer = setInterval(() => setNow(nowSeconds()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (now === null) return <>{fallback}</>;

  const start = Math.floor(new Date(startsAt).getTime() / 1000);
  const end = endsAt ? Math.floor(new Date(endsAt).getTime() / 1000) : start + 3 * 3600;
  if (now >= start && now < end) return <>happening now</>;
  if (now >= end) return <>{fallback}</>;
  return <>{formatCountdown(start - now)}</>;
}
