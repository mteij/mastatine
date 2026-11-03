import sql from "@/lib/db";
import { toDetails, type SubscriptionMail } from "@/lib/activity-emails";
import { waitlistSpotEmail } from "@/lib/email-templates";
import { sendMail } from "@/lib/mailer";

/** After being told a spot is free, a person stays on the list this long before dropping off. */
export const HOLD_HOURS = 24;
export const MAX_WAITLIST = 200;

export interface WaitlistInfo {
  /** Whether the viewer is on the list, and their place (1 = next). */
  onList: boolean;
  position: number | null;
  /** Everyone waiting, for committees. */
  total: number;
}

export async function getWaitlistInfo(activityId: string, userId: string | null): Promise<WaitlistInfo> {
  const [row] = await sql<{ total: number; position: number | null; on_list: boolean }[]>`
    SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE user_id = ${userId})::int > 0 AS on_list,
      (SELECT COUNT(*)::int FROM activity_waitlist w2 WHERE w2.activity_id = ${activityId}
        AND w2.created_at <= (SELECT created_at FROM activity_waitlist WHERE activity_id = ${activityId} AND user_id = ${userId})) AS position
    FROM activity_waitlist WHERE activity_id = ${activityId}
  `;
  return { onList: row.on_list, position: row.on_list ? row.position : null, total: row.total };
}

/**
 * Tells the next people on the list when spots are free. One statement decides who is told, so overlapping runs
 * never notify the same person twice; people told within the last HOLD_HOURS count as taking a spot.
 */
export async function notifyWaitlist(activityId: string): Promise<number> {
  const picked = await sql<{ user_id: string }[]>`
    WITH open AS (
      SELECT a.id, a.subscription_limit FROM activities a
      WHERE a.id = ${activityId} AND a.is_visible AND a.subscription_limit IS NOT NULL
        AND a.starts_at > NOW() AND COALESCE(a.subscription_closes_at, a.starts_at) > NOW()
        AND (a.subscription_opens_at IS NULL OR a.subscription_opens_at <= NOW())
    ),
    free AS (
      SELECT GREATEST(
        o.subscription_limit
          - (SELECT COUNT(*) FROM activity_subscriptions s WHERE s.activity_id = o.id)
          - (SELECT COUNT(*) FROM activity_waitlist w WHERE w.activity_id = o.id AND w.notified_at > NOW() - make_interval(hours => ${HOLD_HOURS})),
        0) AS n
      FROM open o
    ),
    next AS (
      SELECT w.user_id FROM activity_waitlist w
      WHERE w.activity_id = ${activityId} AND w.notified_at IS NULL
      ORDER BY w.created_at LIMIT (SELECT n FROM free)
    )
    UPDATE activity_waitlist w SET notified_at = NOW() FROM next
    WHERE w.activity_id = ${activityId} AND w.user_id = next.user_id
    RETURNING w.user_id
  `;
  if (picked.length === 0) return 0;

  const rows = await sql<SubscriptionMail[]>`
    SELECT a.id AS activity_id, u.id AS user_id, u.email, a.name AS activity_name, c.name AS committee_name,
      a.starts_at, a.location, FALSE AS allow_unsubscribe, NULL::int AS price_cents, '[]'::jsonb AS choices
    FROM activities a JOIN committees c ON c.id = a.committee_id JOIN "user" u ON u.id IN ${sql(picked.map((p) => p.user_id))}
    WHERE a.id = ${activityId} AND NOT u.banned
  `;
  for (const row of rows) {
    try {
      await sendMail({ to: row.email, ...waitlistSpotEmail(toDetails(row), HOLD_HOURS) });
    } catch (error) {
      console.error("Failed to send a waitlist notice:", (error as Error).message);
      // Release the spot so the next run tells them (or someone else) instead.
      await sql`UPDATE activity_waitlist SET notified_at = NULL WHERE activity_id = ${activityId} AND user_id = ${row.user_id}`;
    }
  }
  return rows.length;
}

/** Periodic sweep: drops people who ignored their notice, then tells whoever is next for every activity with a waitlist. */
export async function processWaitlists(): Promise<number> {
  await sql`DELETE FROM activity_waitlist WHERE notified_at < NOW() - make_interval(hours => ${HOLD_HOURS})`;
  const activities = await sql<{ activity_id: string }[]>`SELECT DISTINCT activity_id FROM activity_waitlist WHERE notified_at IS NULL`;
  let told = 0;
  for (const { activity_id } of activities) told += await notifyWaitlist(activity_id);
  return told;
}
