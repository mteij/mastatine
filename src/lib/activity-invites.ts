import sql from "@/lib/db";
import { formatDateTime } from "@/lib/datetime";
import { absoluteUrl, activityInviteEmail } from "@/lib/email-templates";
import { sendMail } from "@/lib/mailer";

/** The service committees an activity can invite (seeded by migration 011). */
export const BAR_COMMITTEE = "BarCie";
export const PHOTO_COMMITTEE = "PhotoCie";

export interface InviteTargets {
  bar: boolean;
  photo: boolean;
}

interface ActivitySummary {
  id: string;
  name: string;
  committee_id: string;
  starts_at: Date;
  location: string;
  boss_note: string;
  flitcie_note: string;
}

async function memberEmails(committeeName: string): Promise<string[]> {
  const rows = await sql<{ email: string }[]>`
    SELECT DISTINCT u.email FROM committees c
    JOIN committee_members m ON m.committee_id = c.id
    JOIN "user" u ON u.id = m.user_id
    WHERE lower(c.name) = lower(${committeeName})
  `;
  return rows.map((r) => r.email);
}

async function inviteCommittee(committeeName: string, note: string, activity: ActivitySummary, organiser: string) {
  const emails = await memberEmails(committeeName);
  const content = activityInviteEmail({
    committeeName,
    activityName: activity.name,
    organiser,
    startsAt: formatDateTime(activity.starts_at),
    location: activity.location,
    note,
    url: absoluteUrl(`/mastapps/activities/${activity.id}`),
  });
  const results = await Promise.allSettled(emails.map((to) => sendMail({ to, ...content })));
  for (const result of results) {
    if (result.status === "rejected") console.error(`Failed to send the ${committeeName} invitation:`, (result.reason as Error).message);
  }
}

/**
 * Emails the members of the invited service committees. Best effort: a mail problem is logged and never
 * stops the activity from being saved.
 */
export async function notifyInvitedCommittees(activity: ActivitySummary, targets: InviteTargets): Promise<void> {
  if (!targets.bar && !targets.photo) return;
  try {
    const [organiser] = await sql<{ name: string }[]>`SELECT name FROM committees WHERE id = ${activity.committee_id}`;
    const from = organiser?.name ?? "A committee";
    await Promise.all([
      targets.bar ? inviteCommittee(BAR_COMMITTEE, activity.boss_note, activity, from) : null,
      targets.photo ? inviteCommittee(PHOTO_COMMITTEE, activity.flitcie_note, activity, from) : null,
    ]);
  } catch (error) {
    console.error("Failed to notify the invited committees:", (error as Error).message);
  }
}
