import sql from "@/lib/db";

export const AUDIENCES = ["subscribers", "members", "everyone"] as const;
export type Audience = (typeof AUDIENCES)[number];

export const AUDIENCE_LABEL: Record<Audience, string> = {
  subscribers: "Newsletter subscribers",
  members: "Members only",
  everyone: "Everyone",
};

export const AUDIENCE_HINT: Record<Audience, string> = {
  subscribers: "People who subscribed to the newsletter and confirmed it.",
  members: "Members, whether or not they subscribed. Admins and committee members count as members.",
  everyone: "Subscribers plus everyone with an account, members or not.",
};

export function parseAudience(value: unknown): Audience {
  return AUDIENCES.find((a) => a === value) ?? "subscribers";
}

/** Why the reader gets this email, for the footer. */
export const AUDIENCE_REASON: Record<Audience, string> = {
  subscribers: "You receive this because you subscribed to the newsletter (about four times a year).",
  members: "You receive this because you are a member.",
  everyone: "You receive this because you have an account or subscription.",
};

// Fragments are built per call: sql`` must not run at import time (`next build` has no DATABASE_URL).
const memberAccount = () => sql`is_member(u.id)`;

/** Narrows newsletter_subscribers (alias s) to the audience. Everyone on the list qualifies for "subscribers" and "everyone". */
export function recipientFilter(audience: Audience) {
  if (audience !== "members") return sql`TRUE`;
  return sql`EXISTS (SELECT 1 FROM "user" u WHERE lower(u.email) = lower(s.email) AND NOT u.banned AND ${memberAccount()})`;
}

/**
 * Puts the accounts of the audience on the list, so every recipient has an unsubscribe link and a delivery record.
 * People who unsubscribed (or have not confirmed) are never touched, and banned accounts are skipped.
 */
export async function materialiseAudience(audience: Audience): Promise<void> {
  if (audience === "subscribers") return;
  const scope = audience === "members" ? memberAccount() : sql`TRUE`;
  await sql`
    INSERT INTO newsletter_subscribers (email, status, confirmed_at)
    SELECT lower(u.email), 'confirmed', NOW() FROM "user" u
    WHERE NOT u.banned AND ${scope}
    ON CONFLICT ((lower(email))) DO NOTHING
  `;
}

/** How many people an issue would reach right now. Counts exclude anyone who unsubscribed or has not confirmed. */
export async function countAudience(audience: Audience): Promise<number> {
  if (audience === "subscribers") {
    const [row] = await sql<{ n: number }[]>`SELECT COUNT(*)::int AS n FROM newsletter_subscribers WHERE status = 'confirmed'`;
    return row.n;
  }
  const notOnTheList = sql`NOT EXISTS (SELECT 1 FROM newsletter_subscribers s WHERE lower(s.email) = lower(u.email))`;
  if (audience === "members") {
    const [row] = await sql<{ n: number }[]>`
      SELECT COUNT(*)::int AS n FROM "user" u
      WHERE NOT u.banned AND ${memberAccount()}
        AND (${notOnTheList} OR EXISTS (SELECT 1 FROM newsletter_subscribers s WHERE lower(s.email) = lower(u.email) AND s.status = 'confirmed'))
    `;
    return row.n;
  }
  const [row] = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int AS n FROM (
      SELECT lower(email) AS email FROM newsletter_subscribers WHERE status = 'confirmed'
      UNION
      SELECT lower(u.email) FROM "user" u WHERE NOT u.banned AND ${notOnTheList}
    ) everyone
  `;
  return row.n;
}
