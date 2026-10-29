"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const icon = { viewBox: "0 0 24 24", width: 18, height: 18, fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const UserIcon = () => (
  <svg {...icon}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
const ShieldIcon = () => (
  <svg {...icon}>
    <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />
  </svg>
);

/** Sign-in state is read on the client so every page can stay statically rendered. */
export default function SidebarAccount() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <span style={{ minHeight: "2.4rem" }} aria-hidden />;

  if (!session) {
    return (
      <Link href="/login" aria-label="Sign in">
        <UserIcon />
        <span>Sign in</span>
      </Link>
    );
  }

  return (
    <>
      <Link href="/account" aria-label="Your account">
        <UserIcon />
        <span>Your account</span>
      </Link>
      {session.user.role === "admin" && (
        <Link href="/admin" aria-label="Admin">
          <ShieldIcon />
          <span>Admin</span>
        </Link>
      )}
    </>
  );
}
