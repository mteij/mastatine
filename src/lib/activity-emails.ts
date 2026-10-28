import sql from "@/lib/db";
import { formatDateTime } from "@/lib/datetime";
import { absoluteUrl, activityConfirmationEmail, activityReminderEmail, type ActivityMailDetails, type EmailContent } from "@/lib/email-templates";
import { sendMail } from "@/lib/mailer";
import { formatEuro, type SignupPick } from "@/lib/signup-options";

interface SubscriptionMail {
  activity_id: string;
  user_id: string;
  email: string;
  activity_name: string;
  committee_name: string;
  starts_at: Date;
  location: string;
  allow_unsubscribe: boolean;
  price_cents: number | null;
  choices: SignupPick[];
}

function toDetails(row: SubscriptionMail): ActivityMailDetails {
  return {
    activityName: row.activity_name,
    committeeName: row.committee_name,
    startsAt: formatDateTime(row.starts_at),
    location: row.location,
    choices: row.choices.map((c) => c.choice).join(", "),
    price: row.price_cents === null ? null : row.price_cents === 0 ? "For free" : formatEuro(row.price_cents),
    canUnsubscribe: row.allow_unsubscribe && row.starts_at > new Date(),
    url: absoluteUrl(`/mastapps/activities/${row.activity_id}`),
    calendarUrl: absoluteUrl(`/mastapps/activities/${row.activity_id}/event.ics`),
  };
}

const mailColumns = () => sql`
  s.activity_id, s.user_id, u.email, a.name AS activity_name, c.name AS committee_name,
  a.starts_at, a.location, a.allow_unsubscribe, s.price_cents, s.choices
`;

/** Emails the member a confirmation of their new subscription. Best effort: a mail problem is logged, never thrown. */
export async function sendSubscriptionConfirmation(activityId: string, userId: string): Promise<void> {
  try {
    const [row] = await sql<SubscriptionMail[]>`
      SELECT ${mailColumns()}
      FROM activity_subscriptions s
      JOIN activities a ON a.id = s.activity_id JOIN committees c ON c.id = a.committee_id JOIN "user" u ON u.id = s.user_id
      WHERE s.activity_id = ${activityId} AND s.user_id = ${userId}
    `;
    if (row) await sendMail({ to: row.email, ...activityConfirmationEmail(toDetails(row)) });
  } catch (error) {
    console.error("Failed to send the subscription confirmation:", (error as Error).message);
  }
}

/**
 * Sends the "tomorrow" reminder to everyone subscribed to an activity that starts within 24 hours. Each subscription is
 * claimed (reminder_sent_at) before its email goes out, so overlapping runs never send twice; a failed send is released
 * to be retried on the next run. People who subscribed less than a day ahead already have their confirmation and are skipped.
 */
export async function sendDueReminders(): Promise<{ sent: number; failed: number }> {
  const due = await sql<SubscriptionMail[]>`
    WITH claimed AS (
      UPDATE activity_subscriptions s SET reminder_sent_at = NOW()
      FROM activities a
      WHERE a.id = s.activity_id AND s.reminder_sent_at IS NULL AND a.is_visible
        AND a.starts_at > NOW() AND a.starts_at <= NOW() + INTERVAL '24 hours'
        AND s.created_at < a.starts_at - INTERVAL '24 hours'
      RETURNING s.activity_id, s.user_id, s.price_cents, s.choices
    )
    SELECT s.activity_id, s.user_id, u.email, a.name AS activity_name, c.name AS committee_name,
      a.starts_at, a.location, a.allow_unsubscribe, s.price_cents, s.choices
    FROM claimed s
    JOIN activities a ON a.id = s.activity_id JOIN committees c ON c.id = a.committee_id JOIN "user" u ON u.id = s.user_id
  `;

  let sent = 0;
  let failed = 0;
  for (const row of due) {
    const content: EmailContent = activityReminderEmail(toDetails(row));
    try {
      await sendMail({ to: row.email, ...content });
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error("Failed to send an activity reminder:", (error as Error).message);
      await sql`UPDATE activity_subscriptions SET reminder_sent_at = NULL WHERE activity_id = ${row.activity_id} AND user_id = ${row.user_id}`;
    }
  }
  return { sent, failed };
}
