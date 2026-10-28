import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import sql from "@/lib/db";
import { requireEnv, siteUrl } from "@/lib/env";
import { sendMail } from "@/lib/mailer";
import { confirmSubscriptionEmail, newsletterEmail } from "@/lib/email-templates";

const CONFIRM_TTL_HOURS = 48;
const RESEND_COOLDOWN_MINUTES = 10;
const SEND_BATCH = 25;
const ERROR_MAX = 200;

/* ───────────────────────────── tokens ───────────────────────────── */

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/** Stateless, unforgeable unsubscribe token: `<subscriberId>.<hmac>`. */
export function signUnsubscribeToken(subscriberId: string): string {
  const mac = createHmac("sha256", requireEnv("BETTER_AUTH_SECRET")).update(`newsletter-unsubscribe:${subscriberId}`).digest("base64url");
  return `${subscriberId}.${mac}`;
}

/** Returns the subscriber id for a valid token, otherwise null. */
export function verifyUnsubscribeToken(token: string): string | null {
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const id = token.slice(0, dot);
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const expected = Buffer.from(signUnsubscribeToken(id));
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? id : null;
}

export const unsubscribePageUrl = (subscriberId: string) => `${siteUrl()}/newsletter/unsubscribe?t=${signUnsubscribeToken(subscriberId)}`;
export const unsubscribeOneClickUrl = (subscriberId: string) => `${siteUrl()}/api/newsletter/unsubscribe?t=${signUnsubscribeToken(subscriberId)}`;

/* ───────────────────────── double opt-in ───────────────────────── */

export const normaliseEmail = (email: string) => email.trim().toLowerCase();

/**
 * Starts (or restarts) a subscription and emails a confirmation link. Never reveals whether the address
 * was already known: callers always show the same message. Already-confirmed addresses get no email, and
 * confirmation emails are rate-limited per address.
 */
export async function requestSubscription(rawEmail: string): Promise<void> {
  const email = normaliseEmail(rawEmail);
  const token = randomBytes(32).toString("base64url");

  const rows = await sql<{ id: string }[]>`
    INSERT INTO newsletter_subscribers (email, status, confirm_token_hash, confirm_expires_at, confirmation_sent_at)
    VALUES (${email}, 'pending', ${sha256(token)}, NOW() + ${`${CONFIRM_TTL_HOURS} hours`}::interval, NOW())
    ON CONFLICT ((lower(email))) DO UPDATE SET
      status = 'pending',
      confirm_token_hash = EXCLUDED.confirm_token_hash,
      confirm_expires_at = EXCLUDED.confirm_expires_at,
      confirmation_sent_at = NOW()
    WHERE newsletter_subscribers.status <> 'confirmed'
      AND (newsletter_subscribers.confirmation_sent_at IS NULL
           OR newsletter_subscribers.confirmation_sent_at < NOW() - ${`${RESEND_COOLDOWN_MINUTES} minutes`}::interval)
    RETURNING id
  `;
  if (rows.length === 0) return;

  const url = `${siteUrl()}/newsletter/confirm?token=${token}`;
  await sendMail({ to: email, ...confirmSubscriptionEmail(url) });
}

/** Remembers the newsletter choice from the sign-in form until the account exists. Opting in is the default. */
export async function rememberSignupChoice(rawEmail: string, newsletter: boolean): Promise<void> {
  await sql`
    INSERT INTO signup_preferences (email, newsletter) VALUES (${normaliseEmail(rawEmail)}, ${newsletter})
    ON CONFLICT ((lower(email))) DO UPDATE SET newsletter = EXCLUDED.newsletter, created_at = NOW()
  `;
}

/**
 * Runs when a new account is created. The sign-in link already proved the address, so unless the person unticked the box
 * on the form they are subscribed straight away (no second confirmation email). Every newsletter carries an unsubscribe link.
 */
export async function applySignupChoice(rawEmail: string): Promise<void> {
  const email = normaliseEmail(rawEmail);
  const [choice] = await sql<{ newsletter: boolean }[]>`DELETE FROM signup_preferences WHERE lower(email) = ${email} RETURNING newsletter`;
  if (choice && !choice.newsletter) return;
  await sql`
    INSERT INTO newsletter_subscribers (email, status, confirmed_at) VALUES (${email}, 'confirmed', NOW())
    ON CONFLICT ((lower(email))) DO UPDATE SET
      status = 'confirmed', confirmed_at = NOW(), unsubscribed_at = NULL, confirm_token_hash = NULL, confirm_expires_at = NULL
  `;
}

export async function confirmSubscription(token: string): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return false;
  const rows = await sql`
    UPDATE newsletter_subscribers
    SET status = 'confirmed', confirmed_at = NOW(), unsubscribed_at = NULL, confirm_token_hash = NULL, confirm_expires_at = NULL
    WHERE confirm_token_hash = ${sha256(token)} AND status = 'pending' AND confirm_expires_at > NOW()
    RETURNING id
  `;
  return rows.length > 0;
}

export async function unsubscribeSubscriber(subscriberId: string): Promise<boolean> {
  const rows = await sql`
    UPDATE newsletter_subscribers
    SET status = 'unsubscribed', unsubscribed_at = NOW(), confirm_token_hash = NULL, confirm_expires_at = NULL
    WHERE id = ${subscriberId} AND status <> 'unsubscribed'
    RETURNING id
  `;
  return rows.length > 0;
}

/** Used when an account is deleted: removes the address entirely (not just suppression). */
export async function deleteSubscriberByEmail(email: string): Promise<void> {
  await sql`DELETE FROM newsletter_subscribers WHERE lower(email) = ${normaliseEmail(email)}`;
}

/* ─────────────────────────── sending ─────────────────────────── */

const running = new Set<string>();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function perMessageDelayMs(): number {
  const perMinute = Math.max(1, Number(process.env.NEWSLETTER_RATE_PER_MIN) || 60);
  return Math.ceil(60_000 / perMinute);
}

export interface IssueStats {
  recipients: number;
  sent: number;
  failed: number;
  pending: number;
}

export async function issueStats(issueId: string): Promise<IssueStats> {
  const [row] = await sql<{ recipients: number; sent: number; failed: number }[]>`
    SELECT
      (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'confirmed')::int AS recipients,
      COUNT(*) FILTER (WHERE status = 'sent')::int AS sent,
      COUNT(*) FILTER (WHERE status = 'failed')::int AS failed
    FROM newsletter_sends WHERE newsletter_id = ${issueId}
  `;
  return { ...row, pending: Math.max(0, row.recipients - row.sent - row.failed) };
}

function isFatalMailError(error: unknown): boolean {
  const code = (error as { code?: string }).code;
  return code === "EAUTH" || code === "ECONNECTION" || code === "ESOCKET" || code === "EDNS";
}

/** Sends one rendered issue to a single address. Used by both the real send and the admin test send. */
async function deliver(issue: { subject: string; body: string }, to: string, subscriberId: string | null): Promise<void> {
  const pageUrl = subscriberId ? unsubscribePageUrl(subscriberId) : `${siteUrl()}/newsletter`;
  const headers: Record<string, string> = { Precedence: "bulk" };
  if (subscriberId) {
    headers["List-Unsubscribe"] = `<${unsubscribeOneClickUrl(subscriberId)}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  await sendMail({ to, headers, ...newsletterEmail(issue.subject, issue.body, pageUrl) });
}

export async function sendTestIssue(issueId: string, to: string): Promise<void> {
  const [issue] = await sql<{ subject: string; body: string }[]>`SELECT subject, body FROM newsletters WHERE id = ${issueId}`;
  if (!issue) throw new Error("Issue not found");
  await deliver({ ...issue, subject: `[TEST] ${issue.subject}` }, to, null);
}

/**
 * Sends an issue to every confirmed subscriber that has not received it yet. Safe to call again after a
 * crash or a failure: delivered recipients are tracked per issue and never mailed twice.
 */
export async function sendIssue(issueId: string): Promise<void> {
  if (running.has(issueId)) return;
  running.add(issueId);

  try {
    const claimed = await sql`
      UPDATE newsletters SET status = 'sending', started_at = COALESCE(started_at, NOW())
      WHERE id = ${issueId} AND status IN ('draft', 'sending') RETURNING id
    `;
    if (claimed.length === 0) return;
    const [issue] = await sql<{ subject: string; body: string }[]>`SELECT subject, body FROM newsletters WHERE id = ${issueId}`;

    const failedThisRun: string[] = [];
    for (;;) {
      const batch = await sql<{ id: string; email: string }[]>`
        SELECT s.id, s.email FROM newsletter_subscribers s
        LEFT JOIN newsletter_sends n ON n.subscriber_id = s.id AND n.newsletter_id = ${issueId}
        WHERE s.status = 'confirmed' AND (n.status IS NULL OR n.status <> 'sent')
          AND s.id <> ALL(${failedThisRun}::uuid[])
        ORDER BY s.created_at LIMIT ${SEND_BATCH}
      `;
      if (batch.length === 0) break;

      for (const subscriber of batch) {
        try {
          await deliver(issue, subscriber.email, subscriber.id);
          await sql`
            INSERT INTO newsletter_sends (newsletter_id, subscriber_id, status, sent_at)
            VALUES (${issueId}, ${subscriber.id}, 'sent', NOW())
            ON CONFLICT (newsletter_id, subscriber_id) DO UPDATE SET status = 'sent', sent_at = NOW(), error = NULL
          `;
        } catch (error) {
          if (isFatalMailError(error)) throw error; // misconfiguration: stop, keep status 'sending' so it can be resumed
          failedThisRun.push(subscriber.id);
          await sql`
            INSERT INTO newsletter_sends (newsletter_id, subscriber_id, status, error)
            VALUES (${issueId}, ${subscriber.id}, 'failed', ${String((error as Error).message).slice(0, ERROR_MAX)})
            ON CONFLICT (newsletter_id, subscriber_id) DO UPDATE SET status = 'failed', error = EXCLUDED.error
          `;
        }
        await sleep(perMessageDelayMs());
      }
    }

    await sql`UPDATE newsletters SET status = 'sent', sent_at = NOW() WHERE id = ${issueId}`;
  } catch (error) {
    console.error(`Newsletter ${issueId} stopped: ${(error as Error).message}`);
  } finally {
    running.delete(issueId);
  }
}

export const isSending = (issueId: string) => running.has(issueId);
