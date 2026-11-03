import sql from "@/lib/db";

type Viewer = { id: string; role?: string | null };

export interface ActivityStat {
  id: string;
  name: string;
  committee_name: string;
  starts_at: Date;
  subscription_limit: number | null;
  going: number;
  waitlist: number;
  unsubscribed: number;
  signups_7d: number;
  messages: number;
}

/** Engagement figures for the activities a person manages (all of them for admins). Counts only, never people. */
export function getActivityStats(user: Viewer): Promise<ActivityStat[]> {
  const scope = user.role === "admin" ? sql`TRUE` : sql`a.committee_id IN (SELECT committee_id FROM committee_members WHERE user_id = ${user.id})`;
  return sql<ActivityStat[]>`
    SELECT a.id, a.name, c.name AS committee_name, a.starts_at, a.subscription_limit,
      (SELECT COUNT(*) FROM activity_subscriptions s WHERE s.activity_id = a.id)::int AS going,
      (SELECT COUNT(*) FROM activity_waitlist w WHERE w.activity_id = a.id)::int AS waitlist,
      (SELECT COUNT(*) FROM activity_events e WHERE e.activity_id = a.id AND e.kind = 'unsubscribed')::int AS unsubscribed,
      (SELECT COUNT(*) FROM activity_events e WHERE e.activity_id = a.id AND e.kind = 'subscribed' AND e.created_at > NOW() - INTERVAL '7 days')::int AS signups_7d,
      (SELECT COUNT(*) FROM activity_messages m WHERE m.activity_id = a.id)::int AS messages
    FROM activities a JOIN committees c ON c.id = a.committee_id
    WHERE ${scope}
    ORDER BY a.starts_at DESC LIMIT 200
  `;
}

export interface StatsSummary {
  upcoming: number;
  signedUpForUpcoming: number;
  waitlisted: number;
  /** Average fill of past activities that had a limit, 0..1; null when there are none. */
  averageFill: number | null;
  /** Share of everyone who signed up (and is tracked) that later unsubscribed, 0..1; null without data. */
  unsubscribeRate: number | null;
}

export function summarise(stats: ActivityStat[], now = new Date()): StatsSummary {
  const upcoming = stats.filter((s) => s.starts_at > now);
  const limitedPast = stats.filter((s) => s.starts_at <= now && s.subscription_limit);
  const going = stats.reduce((n, s) => n + s.going, 0);
  const unsubscribed = stats.reduce((n, s) => n + s.unsubscribed, 0);
  return {
    upcoming: upcoming.length,
    signedUpForUpcoming: upcoming.reduce((n, s) => n + s.going, 0),
    waitlisted: upcoming.reduce((n, s) => n + s.waitlist, 0),
    averageFill: limitedPast.length ? limitedPast.reduce((n, s) => n + Math.min(1, s.going / (s.subscription_limit ?? 1)), 0) / limitedPast.length : null,
    unsubscribeRate: going + unsubscribed > 0 ? unsubscribed / (going + unsubscribed) : null,
  };
}
