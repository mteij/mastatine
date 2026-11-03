"use client";

import AppTile from "@/components/AppTile";
import { ADMIN_APP } from "@/content/apps";
import { authClient } from "@/lib/auth-client";

/** The hub stays statically rendered, so the admin tile appears once the client knows the visitor is an admin. */
export default function AdminAppTile() {
  const { data: session } = authClient.useSession();
  if (session?.user.role !== "admin") return null;
  return (
    <li>
      <AppTile app={ADMIN_APP} />
    </li>
  );
}
