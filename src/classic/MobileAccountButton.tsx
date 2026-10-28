"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

/** Always-visible sign-in / account shortcut for small screens, where the full menu is tucked behind the hamburger. */
export default function MobileAccountButton() {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return null;

  const label = session ? "Your account" : "Sign in";
  return (
    <Link
      href={session ? "/account" : "/login"}
      className="mobile-account lg:hidden"
      aria-label={label}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
      <span>{session ? "Account" : "Sign in"}</span>
    </Link>
  );
}
