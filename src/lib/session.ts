import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";

/** Current session (or null), deduplicated per request. */
export const getSession = cache(async () => getAuth().api.getSession({ headers: await headers() }));

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Admin pages 404 for everyone else so their existence is not advertised. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") notFound();
  return session;
}
