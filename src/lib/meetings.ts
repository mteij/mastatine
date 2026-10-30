import sql from "@/lib/db";
import { LOCK_SECONDS } from "@/lib/minutes-live";

import type { MeetingStatus } from "@/lib/minutes-format";

export type { MeetingStatus };

export interface Meeting {
  id: string;
  committee_id: string;
  committee_name: string;
  title: string;
  starts_at: Date;
  location: string;
  /** The meeting's status (the column predates the open/done/locked statuses and kept its name). */
  minutes_status: MeetingStatus;
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
  /** The agenda item it was raised under, if it still exists. */
  item_id: string | null;
  item_title: string | null;
}

/** An action point as shown under its agenda item. */
export interface ItemAction {
  id: string;
  body: string;
  assignee_name: string | null;
  deadline: string | null;
  is_done: boolean;
}

type Viewer = { id: string; role?: string | null };

const meetingScope = (user: Viewer) =>
  user.role === "admin" ? sql`TRUE` : sql`m.committee_id IN (SELECT committee_id FROM committee_members WHERE user_id = ${user.id})`;

const actionScope = (user: Viewer) =>
  user.role === "admin" ? sql`TRUE` : sql`a.committee_id IN (SELECT committee_id FROM committee_members WHERE user_id = ${user.id})`;

// Fragments are built per call: sql`` must not run at import time (`next build` has no DATABASE_URL).
const meetingColumns = () => sql`m.id, m.committee_id, c.name AS committee_name, m.title, m.starts_at, m.location, m.minutes_status`;

export function getMeetings(user: Viewer, limit = 100) {
  return sql<Meeting[]>`
    SELECT ${meetingColumns()} FROM meetings m JOIN committees c ON c.id = m.committee_id
    WHERE ${meetingScope(user)} ORDER BY m.starts_at DESC LIMIT ${limit}
  `;
}

export interface MeetingFilters {
  q: string;
  committeeId: string;
  status: MeetingStatus | "";
  /** YYYY-MM-DD, inclusive, in the association's time zone. */
  from: string;
  to: string;
  when: "upcoming" | "past" | "";
  openActions: boolean;
  sort: "newest" | "oldest";
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[0-9a-f-]{36}$/i;

/** Reads filter fields from a query string; anything unrecognised falls back to "no filter". */
export function parseMeetingFilters(params: Record<string, string | undefined>): MeetingFilters {
  const day = (value?: string) => (value && DAY.test(value) ? value : "");
  return {
    q: (params.q ?? "").trim().slice(0, 100),
    committeeId: params.committee && ID.test(params.committee) ? params.committee : "",
    status: params.status === "open" || params.status === "done" || params.status === "locked" ? params.status : "",
    from: day(params.from),
    to: day(params.to),
    when: params.when === "upcoming" || params.when === "past" ? params.when : "",
    openActions: params.actions === "open",
    sort: params.sort === "oldest" ? "oldest" : "newest",
  };
}

/** True when anything beyond the default list is asked for. */
export const hasMeetingFilters = (f: MeetingFilters): boolean =>
  Boolean(f.q || f.committeeId || f.status || f.from || f.to || f.when || f.openActions || f.sort !== "newest");

const LOCAL_DAY = (column: ReturnType<typeof sql>) => sql`(${column} AT TIME ZONE 'Europe/Amsterdam')::date`;

/** Meetings the user can see that match every filter. Search covers the title, place, committee, agenda and minutes text. */
export function searchMeetings(user: Viewer, f: MeetingFilters, limit = 200) {
  const pattern = `%${f.q.replace(/[\\%_]/g, "\\$&")}%`;
  const startsDay = LOCAL_DAY(sql`m.starts_at`);
  const conditions = [
    meetingScope(user),
    ...(f.q
      ? [sql`(m.title ILIKE ${pattern} OR m.location ILIKE ${pattern} OR c.name ILIKE ${pattern}
          OR EXISTS (SELECT 1 FROM meeting_items i WHERE i.meeting_id = m.id AND (i.title ILIKE ${pattern} OR i.notes ILIKE ${pattern})))`]
      : []),
    ...(f.committeeId ? [sql`m.committee_id = ${f.committeeId}`] : []),
    ...(f.status ? [sql`m.minutes_status = ${f.status}`] : []),
    ...(f.from ? [sql`${startsDay} >= ${f.from}::date`] : []),
    ...(f.to ? [sql`${startsDay} <= ${f.to}::date`] : []),
    ...(f.when === "upcoming" ? [sql`${startsDay} >= ${LOCAL_DAY(sql`NOW()`)}`] : []),
    ...(f.when === "past" ? [sql`${startsDay} < ${LOCAL_DAY(sql`NOW()`)}`] : []),
    ...(f.openActions ? [sql`EXISTS (SELECT 1 FROM action_points a WHERE a.meeting_id = m.id AND NOT a.is_done)`] : []),
  ];
  const where = conditions.reduce((all, condition) => sql`${all} AND ${condition}`);
  const order = f.sort === "oldest" ? sql`m.starts_at ASC` : sql`m.starts_at DESC`;
  return sql<Meeting[]>`
    SELECT ${meetingColumns()} FROM meetings m JOIN committees c ON c.id = m.committee_id
    WHERE ${where} ORDER BY ${order} LIMIT ${limit}
  `;
}

export async function getMeeting(id: string, user: Viewer): Promise<Meeting | null> {
  const [row] = await sql<Meeting[]>`
    SELECT ${meetingColumns()} FROM meetings m JOIN committees c ON c.id = m.committee_id
    WHERE m.id = ${id} AND ${meetingScope(user)}
  `;
  return row ?? null;
}

export interface PreviousAgenda {
  title: string;
  starts_at: Date;
  items: { level: 0 | 1; title: string }[];
}

/** For each committee, the agenda of its latest meeting that has one, so a new meeting can start from it. */
export async function getPreviousAgendas(committeeIds: string[]): Promise<Record<string, PreviousAgenda>> {
  if (committeeIds.length === 0) return {};
  const rows = await sql<(PreviousAgenda & { committee_id: string })[]>`
    SELECT DISTINCT ON (m.committee_id) m.committee_id, m.title, m.starts_at,
      (SELECT json_agg(json_build_object('level', i.level, 'title', i.title) ORDER BY i.position) FROM meeting_items i WHERE i.meeting_id = m.id) AS items
    FROM meetings m
    WHERE m.committee_id IN ${sql(committeeIds)} AND EXISTS (SELECT 1 FROM meeting_items i WHERE i.meeting_id = m.id)
    ORDER BY m.committee_id, m.starts_at DESC
  `;
  return Object.fromEntries(rows.map(({ committee_id, ...agenda }) => [committee_id, agenda]));
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
  actions: ItemAction[];
}

export function getLiveItems(meetingId: string, userId: string) {
  return sql<LiveItem[]>`
    SELECT i.id, i.level, i.title, i.notes,
      CASE WHEN i.locked_by IS NOT NULL AND i.locked_by <> ${userId} AND i.locked_at > NOW() - make_interval(secs => ${LOCK_SECONDS})
        THEN COALESCE(NULLIF(u.name, ''), 'a colleague') END AS locked_by_name,
      COALESCE((
        SELECT json_agg(json_build_object('id', a.id, 'body', a.body, 'assignee_name', au.name, 'deadline', a.deadline::text, 'is_done', a.is_done) ORDER BY a.created_at)
        FROM action_points a LEFT JOIN "user" au ON au.id = a.assignee_id WHERE a.item_id = i.id
      ), '[]') AS actions
    FROM meeting_items i LEFT JOIN "user" u ON u.id = i.locked_by
    WHERE i.meeting_id = ${meetingId} ORDER BY i.position
  `;
}

const actionColumns = () => sql`
  a.id, a.meeting_id, c.name AS committee_name, a.assignee_id, u.name AS assignee_name,
  a.body, a.deadline::text AS deadline, a.is_done, a.item_id, i.title AS item_title
`;
const actionJoins = () => sql`
  JOIN committees c ON c.id = a.committee_id LEFT JOIN "user" u ON u.id = a.assignee_id LEFT JOIN meeting_items i ON i.id = a.item_id
`;

export function getMeetingActions(meetingId: string) {
  return sql<ActionPoint[]>`
    SELECT ${actionColumns()} FROM action_points a ${actionJoins()}
    WHERE a.meeting_id = ${meetingId} ORDER BY a.is_done, a.created_at
  `;
}

/** One action point, for the edit page; null when the viewer's committees do not include it. */
export async function getAction(id: string, user: Viewer): Promise<(ActionPoint & { committee_id: string; minutes_status: MeetingStatus }) | null> {
  const [row] = await sql<(ActionPoint & { committee_id: string; minutes_status: MeetingStatus })[]>`
    SELECT ${actionColumns()}, a.committee_id, m.minutes_status
    FROM action_points a ${actionJoins()} JOIN meetings m ON m.id = a.meeting_id
    WHERE a.id = ${id} AND ${actionScope(user)}
  `;
  return row ?? null;
}

/** Open points, plus done ones until the committee has held a meeting since they were ticked off. */
const stillListed = () => sql`(
  NOT a.is_done OR NOT EXISTS (
    SELECT 1 FROM meetings later WHERE later.committee_id = a.committee_id AND later.starts_at > a.done_at AND later.starts_at <= NOW()
  )
)`;

/** Action points assigned to the user: open ones first, then recently done ones (crossed out). */
export function getMyActions(userId: string) {
  return sql<ActionPoint[]>`
    SELECT ${actionColumns()} FROM action_points a ${actionJoins()}
    WHERE a.assignee_id = ${userId} AND ${stillListed()}
    ORDER BY a.is_done, c.name, a.deadline NULLS LAST, a.created_at
  `;
}

/** Action points of the committees the user can see, open ones first. */
export function getCommitteeActions(user: Viewer, includeDone: boolean) {
  const done = includeDone ? sql`TRUE` : stillListed();
  return sql<ActionPoint[]>`
    SELECT ${actionColumns()} FROM action_points a ${actionJoins()}
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

// Client components import these from "@/lib/minutes-format": this file reaches the database.
export { STATUS_LABEL, formatDeadline, isOverdue } from "@/lib/minutes-format";
