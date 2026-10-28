"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { sendSubscriptionConfirmation } from "@/lib/activity-emails";
import { notifyInvitedCommittees } from "@/lib/activity-invites";
import { getMembership } from "@/lib/membership";
import { isCommitteeMember } from "@/lib/committees";
import { fromLocalInput } from "@/lib/datetime";
import { storePoster } from "@/lib/poster";
import { createRateLimiter } from "@/lib/rate-limit";
import { requireNamedSession } from "@/lib/session";
import { lowestTotalIsValid, parseSignupGroups, quoteSignup, signupGroupsSchema } from "@/lib/signup-options";

const BASE = "/mastapps/activities";
const saveLimiter = createRateLimiter(30, 60 * 60 * 1000);
const subscribeLimiter = createRateLimiter(60, 60 * 1000);

// Server actions are public HTTP endpoints: each one re-checks the session itself.
// Signed in, and with a display name: other people see that name, never the email address.
const requireSignedIn = () => requireNamedSession(BASE);

function refresh(id?: string) {
  revalidatePath(BASE);
  revalidatePath(`${BASE}/mine`);
  if (id) revalidatePath(`${BASE}/${id}`);
}

export interface ActivityFormState {
  error?: string;
}

const optionalInt = (max: number) =>
  z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().min(0).max(max).nullable());
const optionalMoney = z.preprocess((v) => (v === "" || v == null ? null : Number(String(v).replace(",", "."))), z.number().min(0).max(10000).nullable());
const yesNo = z.enum(["yes", "no"]).transform((v) => v === "yes");
const checkbox = z.string().optional().transform((v) => v === "on");
const dateTime = (message: string) => z.string().transform((v, ctx) => {
  const date = fromLocalInput(v);
  if (!date) ctx.addIssue({ code: "custom", message });
  return date as Date;
});
const optionalDateTime = (message: string) => z.string().transform((v, ctx) => {
  if (!v) return null;
  const date = fromLocalInput(v);
  if (!date) ctx.addIssue({ code: "custom", message });
  return date;
});

const activitySchema = z.object({
  id: z.uuid().optional().or(z.literal("")),
  committee_id: z.uuid("Pick a committee."),
  name: z.string().trim().min(1, "Give the activity a name.").max(120, "That name is too long."),
  description: z.string().trim().max(5000, "The description is too long."),
  location: z.string().trim().max(200, "The location is too long."),
  cost: optionalMoney,
  subscription_limit: optionalInt(100000),
  estimated_attendees: optionalInt(100000),
  starts_at: dateTime("Pick a valid start date and time."),
  ends_at: optionalDateTime("Pick a valid end date and time."),
  subscription_opens_at: optionalDateTime("Pick a valid date for when the subscription opens."),
  subscription_closes_at: optionalDateTime("Pick a valid date for when the subscription closes."),
  allow_unsubscribe: checkbox,
  needs_ero: yesNo,
  uses_budget: yesNo,
  invite_boss: checkbox,
  boss_note: z.string().trim().max(2000),
  invite_flitcie: checkbox,
  flitcie_note: z.string().trim().max(2000),
  is_visible: checkbox,
  members_only: checkbox,
  signup_options: z.string().max(20000).optional(),
});

export async function saveActivity(_prev: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  const session = await requireSignedIn();
  const parsed = activitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  if (!saveLimiter.allow(`user:${session.user.id}`)) return { error: "You are saving quickly. Try again in a while." };
  if (d.ends_at && d.ends_at <= d.starts_at) return { error: "The end must be after the start." };
  if (d.subscription_opens_at && d.subscription_closes_at && d.subscription_closes_at <= d.subscription_opens_at) {
    return { error: "The subscription must close after it opens." };
  }
  if (!(await isCommitteeMember(session.user, d.committee_id))) return { error: "You are not a member of that committee." };

  const signupOptions = signupGroupsSchema.safeParse(parseJson(d.signup_options || "[]"));
  if (!signupOptions.success) return { error: "Check the signup options: every choice and option needs a name and a valid price." };
  if (!lowestTotalIsValid(d.cost === null ? null : Math.round(d.cost * 100), signupOptions.data)) {
    return { error: "The cheapest combination of options would cost less than nothing. Lower the discounts or raise the base cost." };
  }

  const id = d.id || null;
  let existingPoster: string | null = null;
  let alreadyInvited = { bar: false, photo: false };
  if (id) {
    const [existing] = await sql<{ committee_id: string; poster_url: string | null; invite_boss: boolean; invite_flitcie: boolean }[]>`
      SELECT committee_id, poster_url, invite_boss, invite_flitcie FROM activities WHERE id = ${id}
    `;
    if (!existing || !(await isCommitteeMember(session.user, existing.committee_id))) return { error: "You cannot edit this activity." };
    existingPoster = existing.poster_url;
    alreadyInvited = { bar: existing.invite_boss, photo: existing.invite_flitcie };
  }

  let posterUrl = existingPoster;
  const poster = formData.get("poster");
  if (poster instanceof File && poster.size > 0) {
    const stored = await storePoster(poster);
    if ("error" in stored) return { error: stored.error };
    posterUrl = stored.url;
  }

  const cost_cents = d.cost === null ? null : Math.round(d.cost * 100);
  const values = {
    committee_id: d.committee_id,
    name: d.name,
    description: d.description,
    location: d.location,
    cost_cents,
    subscription_limit: d.subscription_limit || null,
    estimated_attendees: d.estimated_attendees,
    starts_at: d.starts_at,
    ends_at: d.ends_at,
    subscription_opens_at: d.subscription_opens_at,
    subscription_closes_at: d.subscription_closes_at,
    allow_unsubscribe: d.allow_unsubscribe,
    needs_ero: d.needs_ero,
    uses_budget: d.uses_budget,
    invite_boss: d.invite_boss,
    boss_note: d.boss_note,
    invite_flitcie: d.invite_flitcie,
    flitcie_note: d.flitcie_note,
    is_visible: d.is_visible,
    members_only: d.members_only,
    signup_options: sql.json(signupOptions.data),
    poster_url: posterUrl,
  };

  // Only newly invited committees are emailed, so editing an activity does not re-send.
  const newInvites = { bar: d.invite_boss && !alreadyInvited.bar, photo: d.invite_flitcie && !alreadyInvited.photo };
  const summary = { name: d.name, committee_id: d.committee_id, starts_at: d.starts_at, location: d.location, boss_note: d.boss_note, flitcie_note: d.flitcie_note };

  if (id) {
    await sql`UPDATE activities SET ${sql(values)} WHERE id = ${id}`;
    await notifyInvitedCommittees({ id, ...summary }, newInvites);
    refresh(id);
    redirect(`${BASE}/${id}`);
  }
  const [created] = await sql<{ id: string }[]>`INSERT INTO activities ${sql({ ...values, created_by: session.user.id })} RETURNING id`;
  await notifyInvitedCommittees({ id: created.id, ...summary }, newInvites);
  refresh();
  redirect(`${BASE}/${created.id}`);
}

const activityId = z.uuid();

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function subscribe(formData: FormData) {
  const session = await requireSignedIn();
  const id = activityId.parse(formData.get("id"));
  if (!subscribeLimiter.allow(`user:${session.user.id}`)) throw new Error("Slow down a little.");

  const { isMember } = await getMembership();
  const [activity] = await sql<{ cost_cents: number | null; signup_options: unknown; members_only: boolean }[]>`
    SELECT cost_cents, signup_options, members_only FROM activities WHERE id = ${id} AND is_visible
  `;
  if (!activity || (activity.members_only && !isMember)) return;
  const groups = parseSignupGroups(activity.signup_options);
  const selection = Object.fromEntries(groups.map((g) => [g.id, String(formData.get(`opt_${g.id}`) ?? "")]));
  const quote = quoteSignup(activity.cost_cents, groups, selection);
  if ("error" in quote) throw new Error(quote.error);

  // One statement so the limit holds under concurrent sign-ups. It returns a row only when this call created the subscription.
  const created = await sql`
    INSERT INTO activity_subscriptions (activity_id, user_id, choices, price_cents)
    SELECT a.id, ${session.user.id}, ${sql.json(quote.picks)}, ${quote.price_cents} FROM activities a
    WHERE a.id = ${id} AND a.is_visible AND (${isMember} OR NOT a.members_only)
      AND (a.subscription_opens_at IS NULL OR a.subscription_opens_at <= NOW())
      AND COALESCE(a.subscription_closes_at, a.starts_at) > NOW()
      AND (a.subscription_limit IS NULL OR (SELECT COUNT(*) FROM activity_subscriptions s WHERE s.activity_id = a.id) < a.subscription_limit)
    ON CONFLICT DO NOTHING
    RETURNING activity_id
  `;
  if (created.length > 0) after(() => sendSubscriptionConfirmation(id, session.user.id));
  refresh(id);
}

export async function unsubscribe(formData: FormData) {
  const session = await requireSignedIn();
  const id = activityId.parse(formData.get("id"));
  await sql`
    DELETE FROM activity_subscriptions
    WHERE activity_id = ${id} AND user_id = ${session.user.id}
      AND EXISTS (SELECT 1 FROM activities a WHERE a.id = ${id} AND a.allow_unsubscribe AND a.starts_at > NOW())
  `;
  refresh(id);
}

export async function deleteActivity(formData: FormData) {
  const session = await requireSignedIn();
  const id = activityId.parse(formData.get("id"));
  const [row] = await sql<{ committee_id: string }[]>`SELECT committee_id FROM activities WHERE id = ${id}`;
  if (!row || !(await isCommitteeMember(session.user, row.committee_id))) return;
  await sql`DELETE FROM activities WHERE id = ${id}`;
  refresh();
  redirect(`${BASE}/mine`);
}
