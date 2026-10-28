import sql from "@/lib/db";

export interface Activity {
  id: string;
  committee_id: string;
  committee_name: string;
  name: string;
  description: string;
  location: string;
  cost_cents: number | null;
  subscription_limit: number | null;
  estimated_attendees: number | null;
  starts_at: Date;
  ends_at: Date | null;
  subscription_opens_at: Date | null;
  subscription_closes_at: Date | null;
  allow_unsubscribe: boolean;
  needs_ero: boolean;
  uses_budget: boolean;
  invite_boss: boolean;
  boss_note: string;
  invite_flitcie: boolean;
  flitcie_note: string;
  is_visible: boolean;
  poster_url: string | null;
  created_by: string | null;
  participants: number;
  subscribed: boolean;
}

type Viewer = { id: string; role?: string | null };

const columns = (userId: string) => sql`
  a.*, c.name AS committee_name,
  (SELECT COUNT(*) FROM activity_subscriptions s WHERE s.activity_id = a.id)::int AS participants,
  EXISTS (SELECT 1 FROM activity_subscriptions s WHERE s.activity_id = a.id AND s.user_id = ${userId}) AS subscribed
`;

/** Upcoming (and the last week of) visible activities, soonest first. */
export function getActivities(userId: string) {
  return sql<Activity[]>`
    SELECT ${columns(userId)} FROM activities a JOIN committees c ON c.id = a.committee_id
    WHERE a.is_visible AND a.starts_at > NOW() - INTERVAL '7 days'
    ORDER BY a.starts_at LIMIT 200
  `;
}

export interface UpcomingActivity {
  id: string;
  name: string;
  location: string;
  starts_at: Date;
  ends_at: Date | null;
  committee_name: string;
}

/** The next visible activities that have not ended yet, for the public homepage. */
export function getUpcomingActivities(limit: number) {
  return sql<UpcomingActivity[]>`
    SELECT a.id, a.name, a.location, a.starts_at, a.ends_at, c.name AS committee_name
    FROM activities a JOIN committees c ON c.id = a.committee_id
    WHERE a.is_visible AND COALESCE(a.ends_at, a.starts_at + INTERVAL '3 hours') > NOW()
    ORDER BY a.starts_at LIMIT ${limit}
  `;
}

export async function getActivity(id: string, userId: string): Promise<Activity | null> {
  const [row] = await sql<Activity[]>`
    SELECT ${columns(userId)} FROM activities a JOIN committees c ON c.id = a.committee_id WHERE a.id = ${id}
  `;
  return row ?? null;
}

/** Activities organised by the committees the user sits on (all of them for admins), including hidden ones. */
export function getManagedActivities(user: Viewer) {
  const scope = user.role === "admin" ? sql`TRUE` : sql`a.committee_id IN (SELECT committee_id FROM committee_members WHERE user_id = ${user.id})`;
  return sql<Activity[]>`
    SELECT ${columns(user.id)} FROM activities a JOIN committees c ON c.id = a.committee_id
    WHERE ${scope} ORDER BY a.starts_at DESC LIMIT 200
  `;
}

export function getParticipants(activityId: string) {
  return sql<{ id: string; name: string; email: string }[]>`
    SELECT u.id, u.name, u.email FROM activity_subscriptions s JOIN "user" u ON u.id = s.user_id
    WHERE s.activity_id = ${activityId} ORDER BY s.created_at
  `;
}

export type SubscribeState = "open" | "full" | "not-yet" | "closed";

export function subscribeState(a: Activity, now = new Date()): SubscribeState {
  if (a.subscription_opens_at && now < a.subscription_opens_at) return "not-yet";
  if ((a.subscription_closes_at ?? a.starts_at) < now) return "closed";
  if (a.subscription_limit !== null && a.participants >= a.subscription_limit) return "full";
  return "open";
}

export function formatCost(cents: number | null): string {
  if (!cents) return "For free";
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export const formatParticipants = (a: Activity): string => `${a.participants} / ${a.subscription_limit ?? "∞"}`;
