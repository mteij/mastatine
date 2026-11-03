"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sql from "@/lib/db";
import { setNewsletterChoice } from "@/lib/newsletter";
import { validateDisplayName } from "@/lib/profile";
import { safeNextPath } from "@/lib/safe-redirect";
import { requireUser } from "@/lib/session";

export interface DisplayNameState {
  error?: string;
}

/** Saves the display name, then continues to where the person was going. */
export async function saveDisplayName(_prev: DisplayNameState, formData: FormData): Promise<DisplayNameState> {
  const { user } = await requireUser({ allowUnnamed: true });
  const parsed = validateDisplayName(String(formData.get("name") ?? ""));
  if ("error" in parsed) return { error: parsed.error };

  await sql`UPDATE "user" SET name = ${parsed.name}, "updatedAt" = NOW() WHERE id = ${user.id}`;
  revalidatePath("/", "layout");
  redirect(safeNextPath(String(formData.get("next") ?? ""), "/account"));
}

/** The newsletter setting on the account page. The person is signed in, so their address is already verified. */
export async function setNewsletter(formData: FormData): Promise<void> {
  const { user } = await requireUser();
  await setNewsletterChoice(user.email, formData.get("subscribe") === "yes");
  await sql`UPDATE "user" SET newsletter_prompted_at = COALESCE(newsletter_prompted_at, NOW()) WHERE id = ${user.id}`;
  revalidatePath("/account");
}
