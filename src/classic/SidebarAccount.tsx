"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

/** Sign-in state is read on the client so every page can stay statically rendered. */
export default function SidebarAccount() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <span style={{ minHeight: "1.6em" }} aria-hidden />;

  if (!session) return <Link href="/login">Sign in</Link>;

  return (
    <>
      <Link href="/account">Your account</Link>
      {session.user.role === "admin" && <Link href="/admin">Admin</Link>}
    </>
  );
}
