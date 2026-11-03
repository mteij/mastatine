"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import sql from "@/lib/db";
import { setNewsletterChoice } from "@/lib/newsletter";
import { safeNextPath } from "@/lib/safe-redirect";
import { requireUser } from "@/lib/session";

const answerSchema = z.enum(["yes", "no", "later"]);

/** Records the answer to the one-time newsletter question, then continues to where the person was going. */
export async function answerNewsletterPrompt(formData: FormData): Promise<void> {
  const { user } = await requireUser({ allowUnnamed: true });
  const next = safeNextPath(String(formData.get("next") ?? ""), "/account");
  const answer = answerSchema.safeParse(formData.get("answer"));
  if (!answer.success) redirect(next);

  // "not now" only ends the prompt: the choice stays available on the account page.
  if (answer.data !== "later") await setNewsletterChoice(user.email, answer.data === "yes");
  await sql`UPDATE "user" SET newsletter_prompted_at = NOW() WHERE id = ${user.id}`;
  revalidatePath("/account");
  redirect(next);
}
