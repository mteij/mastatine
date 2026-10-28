"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { POLL_MS } from "@/lib/minutes-live";

/** Re-renders the server page every few seconds while the tab is visible, so readers see minutes as they are written. */
export default function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
