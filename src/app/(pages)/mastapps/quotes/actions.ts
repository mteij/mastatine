"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import sql from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit";
import { getMembership } from "@/lib/membership";
import { getSession } from "@/lib/session";

const QUOTES_PATH = "/mastapps/quotes";
const addLimiter = createRateLimiter(10, 60 * 60 * 1000);
const voteLimiter = createRateLimiter(60, 60 * 1000);

// Server actions are public HTTP endpoints: each one re-checks the session itself.
async function requireSignedIn() {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(QUOTES_PATH)}`);
  return session;
}

/** Quotes are private to members: anyone else is sent to the page that explains how to become one. */
async function requireMember() {
  const session = await requireSignedIn();
  if (!(await getMembership()).isMember) redirect(QUOTES_PATH);
  return session;
}

function refresh() {
  revalidatePath(QUOTES_PATH);
  revalidatePath(`${QUOTES_PATH}/statistics`);
}

const quoteSchema = z.object({
  body: z.string().trim().min(3, "The quote is too short.").max(1000, "Keep the quote under 1000 characters."),
  author: z.string().trim().min(1, "Say who said it.").max(80, "That name is too long."),
  said_on: z.iso.date("Pick a valid date."),
});

export interface QuoteFormState {
  error?: string;
}

export async function addQuote(_prev: QuoteFormState, formData: FormData): Promise<QuoteFormState> {
  const session = await requireMember();
  // Honeypot: real visitors never see or fill this field, so pretend success for bots.
  if (formData.get("website")) redirect(`${QUOTES_PATH}?sort=date`);
  const parsed = quoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { body, author, said_on } = parsed.data;
  if (said_on > new Date().toISOString().slice(0, 10)) return { error: "Nobody has said that yet. Pick today or earlier." };
  if (!addLimiter.allow(`user:${session.user.id}`)) return { error: "You are adding quotes quickly. Try again in a while." };

  await sql`INSERT INTO quotes (body, author, said_on, created_by) VALUES (${body}, ${author}, ${said_on}, ${session.user.id})`;
  refresh();
  redirect(`${QUOTES_PATH}?sort=date`);
}

const voteSchema = z.object({
  quote_id: z.uuid(),
  score: z.coerce.number().int().min(1).max(10),
});

export async function voteQuote(formData: FormData) {
  const session = await requireMember();
  const { quote_id, score } = voteSchema.parse(Object.fromEntries(formData));
  if (!voteLimiter.allow(`user:${session.user.id}`)) throw new Error("Slow down a little.");

  await sql`
    INSERT INTO quote_votes (quote_id, user_id, score) VALUES (${quote_id}, ${session.user.id}, ${score})
    ON CONFLICT (quote_id, user_id) WHERE user_id IS NOT NULL DO UPDATE SET score = EXCLUDED.score
  `;
  refresh();
}

export async function deleteQuote(formData: FormData) {
  const session = await requireMember();
  const quoteId = z.uuid().parse(formData.get("id"));
  // Admins can remove any quote; everyone else only their own.
  if (session.user.role === "admin") {
    await sql`DELETE FROM quotes WHERE id = ${quoteId}`;
  } else {
    await sql`DELETE FROM quotes WHERE id = ${quoteId} AND created_by = ${session.user.id}`;
  }
  refresh();
}
