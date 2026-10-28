import sql from "@/lib/db";

/** Newsletter sign-ups that were never confirmed are dropped after this many days. */
export const UNCONFIRMED_SUBSCRIBER_DAYS = 7;

export interface PurgeResult {
  sessions: number;
  verifications: number;
  unconfirmedSubscribers: number;
}

/**
 * Data minimisation: removes records that have no remaining purpose.
 * Expired sessions hold an IP address and browser type; expired verification rows hold an email address.
 */
export async function purgeExpiredData(): Promise<PurgeResult> {
  const sessions = await sql`DELETE FROM session WHERE "expiresAt" < NOW() RETURNING id`;
  const verifications = await sql`DELETE FROM verification WHERE "expiresAt" < NOW() RETURNING id`;
  const unconfirmedSubscribers = await sql`
    DELETE FROM newsletter_subscribers
    WHERE status = 'pending' AND created_at < NOW() - make_interval(days => ${UNCONFIRMED_SUBSCRIBER_DAYS})
    RETURNING id
  `;
  return {
    sessions: sessions.length,
    verifications: verifications.length,
    unconfirmedSubscribers: unconfirmedSubscribers.length,
  };
}
