import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { hasDisplayName } from "@/lib/profile";

/** Where people without a display name are sent before they can do anything relevant. */
export const NAME_SETUP_PATH = "/account/name";

const nameSetupUrl = (next: string) => `${NAME_SETUP_PATH}?next=${encodeURIComponent(next)}`;

/** Current session (or null), deduplicated per request. */
export const getSession = cache(async () => getAuth().api.getSession({ headers: await headers() }));

interface RequireUserOptions {
  /** Only the account and name pages themselves may skip the display name requirement. */
  allowUnnamed?: boolean;
  /** Where to continue after choosing a name. */
  next?: string;
}

/** A signed-in user with a display name. Everyone else is sent to sign in, or to pick a name first. */
export async function requireUser({ allowUnnamed = false, next = "/account" }: RequireUserOptions = {}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!allowUnnamed && !hasDisplayName(session.user.name)) redirect(nameSetupUrl(next));
  return session;
}

/** For server actions: sign in (back to `next`), then pick a display name (back to `next`). */
export async function requireNamedSession(next: string) {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!hasDisplayName(session.user.name)) redirect(nameSetupUrl(next));
  return session;
}

/** Admin pages 404 for everyone else so their existence is not advertised. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") notFound();
  return session;
}
