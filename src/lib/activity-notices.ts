import sql from "@/lib/db";
import { formatDateTime } from "@/lib/datetime";
import { mailColumns, toDetails, type SubscriptionMail } from "@/lib/activity-emails";
import {
  absoluteUrl,
  activityCancelledEmail,
  activityChangedEmail,
  activityMessageEmail,
  type ActivityChange,
  type EmailContent,
} from "@/lib/email-templates";
import { sendMail } from "@/lib/mailer";

const BATCH = 10;

/** Sends one email per address, a few at a time. Failures are logged and counted, never thrown. */
async function sendEach<T extends { email: string }>(rows: T[], build: (row: T) => EmailContent, label: string): Promise<number> {
  let sent = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const results = await Promise.allSettled(rows.slice(i, i + BATCH).map((row) => sendMail({ to: row.email, ...build(row) })));
    for (const result of results) {
      if (result.status === "fulfilled") sent += 1;
      else console.error(`Failed to send the ${label}:`, (result.reason as Error).message);
    }
  }
  return sent;
}

function subscribersOf(activityId: string) {
  return sql<SubscriptionMail[]>`
    SELECT ${mailColumns()}
    FROM activity_subscriptions s
    JOIN activities a ON a.id = s.activity_id JOIN committees c ON c.id = a.committee_id JOIN "user" u ON u.id = s.user_id
    WHERE s.activity_id = ${activityId} AND NOT u.banned
  `;
}

async function logMessage(activityId: string, sentBy: string | null, kind: "update" | "message", recipients: number) {
  await sql`INSERT INTO activity_messages (activity_id, sent_by, kind, recipients) VALUES (${activityId}, ${sentBy}, ${kind}, ${recipients})`;
}

/** Tells everyone who is going that the time, place or price changed. Returns how many were emailed. */
export async function notifyActivityChanged(activityId: string, changes: ActivityChange[], note: string, sentBy: string): Promise<number> {
  const rows = await subscribersOf(activityId);
  if (rows.length === 0) return 0;
  const sent = await sendEach(rows, (row) => activityChangedEmail(toDetails(row), changes, note), "activity change notice");
  await logMessage(activityId, sentBy, "update", sent);
  return sent;
}

export interface CancellationNotice {
  send: () => Promise<number>;
}

/** Collects who to tell before the activity is deleted (the subscriptions go with it). Call `send` after the delete. */
export async function prepareCancellation(activityId: string): Promise<CancellationNotice | null> {
  const rows = await subscribersOf(activityId);
  const first = rows[0];
  if (!first || first.starts_at <= new Date()) return null;
  const email = activityCancelledEmail(first.activity_name, first.committee_name, formatDateTime(first.starts_at));
  return { send: () => sendEach(rows, () => email, "cancellation notice") };
}

export const MESSAGES_PER_DAY = 3;

/** How many free-form messages this activity's organisers sent in the last 24 hours. */
export async function messagesSentToday(activityId: string): Promise<number> {
  const [row] = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM activity_messages WHERE activity_id = ${activityId} AND kind = 'message' AND created_at > NOW() - INTERVAL '24 hours'
  `;
  return row.n;
}

/** Emails a message from the organisers to everyone who is going. Returns how many were emailed. */
export async function sendParticipantMessage(
  activityId: string,
  sender: { id: string; name: string },
  message: { subject: string; body: string },
): Promise<number> {
  const rows = await subscribersOf(activityId);
  if (rows.length === 0) return 0;
  const sent = await sendEach(
    rows,
    (row) =>
      activityMessageEmail({
        activityName: row.activity_name,
        committeeName: row.committee_name,
        senderName: sender.name,
        subject: message.subject,
        body: message.body,
        url: absoluteUrl(`/mastapps/activities/${activityId}`),
      }),
    "activity message",
  );
  await logMessage(activityId, sender.id, "message", sent);
  return sent;
}
