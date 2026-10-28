import sql from "@/lib/db";
import { LOCK_SECONDS } from "@/lib/minutes-live";

export type MinutesStatus = "todo" | "draft" | "done";

export interface Meeting {
  id: string;
  committee_id: string;
  committee_name: string;
  title: string;
  starts_at: Date;
  location: string;
  minutes_status: MinutesStatus;
}

export interface MeetingItem {
  id: string;
  position: number;
  level: 0 | 1;
  title: string;
  notes: string;
}

export interface ActionPoint {
  id: string;
  meeting_id: string;
  committee_name: string;
  assignee_id: string | null;
  assignee_name: string | null;
  body: string;
  deadline: string | null; // YYYY-MM-DD
  is_done: boolean;
}

type Viewer = { id: string; role?: string | null };

const meetingScope = (user: Viewer) =>
  user.role === "admin" ? sql`TRUE` : sql`m.committee_id IN (SELECT committee_id FROM committee_members WHERE user_id = ${user.id})`;

const actionScope = (user: Viewer) =>
  user.role === "admin" ? sql`TRUE` : sql`a.committee_id IN (SELECT committee_id FROM committee_members WHERE user_id = ${user.id})`;

const meetingColumns = sql`m.id, m.committee_id, c.name AS committee_name, m.title, m.starts_at, m.location, m.minutes_status`;

export function getMeetings(user: Viewer, limit = 100) {
  return sql<Meeting[]>`
    SELECT ${meetingColumns} FROM meetings m JOIN committees c ON c.id = m.committee_id
    WHERE ${meetingScope(user)} ORDER BY m.starts_at DESC LIMIT ${limit}
  `;
}

export async function getMeeting(id: string, user: Viewer): Promise<Meeting | null> {
  const [row] = await sql<Meeting[]>`
    SELECT ${meetingColumns} FROM meetings m JOIN committees c ON c.id = m.committee_id
    WHERE m.id = ${id} AND ${meetingScope(user)}
  `;
  return row ?? null;
}

export function getItems(meetingId: string) {
  return sql<MeetingItem[]>`SELECT id, position, level, title, notes FROM meeting_items WHERE meeting_id = ${meetingId} ORDER BY position`;
}

export interface LiveItem {
  id: string;
  level: 0 | 1;
  title: string;
  notes: string;
  /** Name of the colleague currently editing this item, or null when it is free or locked by the viewer. */
  locked_by_name: string | null;
}

export function getLiveItems(meetingId: string, userId: string) {
  return sql<LiveItem[]>`
    SELECT i.id, i.level, i.title, i.notes,
      CASE WHEN i.locked_by IS NOT NULL AND i.locked_by <> ${userId} AND i.locked_at > NOW() - make_interval(secs => ${LOCK_SECONDS})
        THEN COALESCE(NULLIF(u.name, ''), 'a colleague') END AS locked_by_name
    FROM meeting_items i LEFT JOIN "user" u ON u.id = i.locked_by
    WHERE i.meeting_id = ${meetingId} ORDER BY i.position
  `;
}

const actionColumns = sql`
  a.id, a.meeting_id, c.name AS committee_name, a.assignee_id, u.name AS assignee_name,
  a.body, a.deadline::text AS deadline, a.is_done
`;

export function getMeetingActions(meetingId: string) {
  return sql<ActionPoint[]>`
    SELECT ${actionColumns} FROM action_points a JOIN committees c ON c.id = a.committee_id LEFT JOIN "user" u ON u.id = a.assignee_id
    WHERE a.meeting_id = ${meetingId} ORDER BY a.is_done, a.created_at
  `;
}

/** Open action points assigned to the user. */
export function getMyActions(userId: string) {
  return sql<ActionPoint[]>`
    SELECT ${actionColumns} FROM action_points a JOIN committees c ON c.id = a.committee_id LEFT JOIN "user" u ON u.id = a.assignee_id
    WHERE a.assignee_id = ${userId} AND NOT a.is_done
    ORDER BY c.name, a.deadline NULLS LAST, a.created_at
  `;
}

/** Action points of the committees the user can see, open ones first. */
export function getCommitteeActions(user: Viewer, includeDone: boolean) {
  const done = includeDone ? sql`TRUE` : sql`NOT a.is_done`;
  return sql<ActionPoint[]>`
    SELECT ${actionColumns} FROM action_points a JOIN committees c ON c.id = a.committee_id LEFT JOIN "user" u ON u.id = a.assignee_id
    WHERE ${actionScope(user)} AND ${done}
    ORDER BY a.is_done, c.name, a.deadline NULLS LAST, a.created_at LIMIT 300
  `;
}

export { itemLabels } from "@/lib/minutes-live";

/** One agenda line per item; a leading "-" makes it a sub-item. */
export function agendaToText(items: Pick<MeetingItem, "level" | "title">[]): string {
  return items.map((i) => (i.level === 1 ? `- ${i.title}` : i.title)).join("\n");
}

export function parseAgenda(text: string): { level: 0 | 1; title: string }[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 100)
    .map((line) => (line.startsWith("-") ? { level: 1 as const, title: line.replace(/^-+\s*/, "").slice(0, 200) } : { level: 0 as const, title: line.slice(0, 200) }))
    .filter((item) => item.title.length > 0);
}

export const STATUS_LABEL: Record<MinutesStatus, string> = { todo: "to do", draft: "draft", done: "done" };

export function formatDeadline(deadline: string | null): string {
  if (!deadline) return "Next meeting";
  return new Date(`${deadline}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "long", timeZone: "UTC" });
}

export const isOverdue = (deadline: string | null): boolean => !!deadline && deadline < new Date().toISOString().slice(0, 10);
