"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import sql from "@/lib/db";
import { isCommitteeMember } from "@/lib/committees";
import { fromLocalInput } from "@/lib/datetime";
import { LOCK_SECONDS } from "@/lib/minutes-live";
import { parseAgenda, type MeetingStatus } from "@/lib/meetings";
import { requireNamedSession } from "@/lib/session";

const BASE = "/mastapps/minutes";

// Server actions are public HTTP endpoints: each one re-checks the session and committee membership itself.
const requireSignedIn = () => requireNamedSession(BASE);

async function requireMeetingAccess(meetingId: string) {
  const session = await requireSignedIn();
  const [meeting] = await sql<{ committee_id: string; minutes_status: MeetingStatus }[]>`
    SELECT committee_id, minutes_status FROM meetings WHERE id = ${meetingId}
  `;
  if (!meeting || !(await isCommitteeMember(session.user, meeting.committee_id))) redirect(BASE);
  return { session, committeeId: meeting.committee_id, status: meeting.minutes_status };
}

/** Like requireMeetingAccess, but a locked meeting cannot be changed: the caller is sent back to read it. */
async function requireEditableMeeting(meetingId: string) {
  const access = await requireMeetingAccess(meetingId);
  if (access.status === "locked") redirect(`${BASE}/meetings/${meetingId}`);
  return access;
}

function refresh(meetingId?: string) {
  revalidatePath(BASE, "layout");
  if (meetingId) revalidatePath(`${BASE}/meetings/${meetingId}`);
}

const uuid = z.uuid();
const meetingDetails = z.object({
  title: z.string().trim().min(1).max(120),
  location: z.string().trim().max(200),
  starts_at: z.string().transform((v, ctx) => {
    const date = fromLocalInput(v);
    if (!date) ctx.addIssue({ code: "custom", message: "Invalid date" });
    return date as Date;
  }),
});

/* ───────────── meetings ───────────── */

export async function createMeeting(formData: FormData) {
  const session = await requireSignedIn();
  const committeeId = uuid.parse(formData.get("committee_id"));
  if (!(await isCommitteeMember(session.user, committeeId))) redirect(BASE);
  const data = meetingDetails.parse(Object.fromEntries(formData));
  const agenda = parseAgenda(String(formData.get("agenda") ?? ""));

  const id = await sql.begin(async (tx) => {
    const [meeting] = await tx<{ id: string }[]>`
      INSERT INTO meetings (committee_id, title, starts_at, location, created_by)
      VALUES (${committeeId}, ${data.title}, ${data.starts_at}, ${data.location}, ${session.user.id}) RETURNING id
    `;
    for (const [position, item] of agenda.entries()) {
      await tx`INSERT INTO meeting_items (meeting_id, position, level, title) VALUES (${meeting.id}, ${position}, ${item.level}, ${item.title})`;
    }
    return meeting.id;
  });
  refresh();
  redirect(`${BASE}/meetings/${id}`);
}

export async function updateMeeting(formData: FormData) {
  const id = uuid.parse(formData.get("id"));
  await requireEditableMeeting(id);
  const data = meetingDetails.parse(Object.fromEntries(formData));
  await sql`UPDATE meetings SET title = ${data.title}, location = ${data.location}, starts_at = ${data.starts_at} WHERE id = ${id}`;
  refresh(id);
  redirect(`${BASE}/meetings/${id}`);
}

export async function deleteMeeting(formData: FormData) {
  const id = uuid.parse(formData.get("id"));
  const { session, status } = await requireMeetingAccess(id);
  // A locked meeting is a record: only an admin may remove it.
  if (status === "locked" && session.user.role !== "admin") redirect(`${BASE}/meetings/${id}`);
  await sql`DELETE FROM meetings WHERE id = ${id}`;
  refresh();
  redirect(`${BASE}/meetings`);
}

/* ───────────── agenda and minutes ───────────── */

/** Rewrites the agenda from one line per item, keeping the notes of items whose title is unchanged. */
export async function saveAgenda(formData: FormData) {
  const id = uuid.parse(formData.get("id"));
  await requireEditableMeeting(id);
  const agenda = parseAgenda(String(formData.get("agenda") ?? ""));

  await sql.begin(async (tx) => {
    const existing = await tx<{ title: string; notes: string }[]>`SELECT title, notes FROM meeting_items WHERE meeting_id = ${id} ORDER BY position`;
    const pool = [...existing];
    await tx`DELETE FROM meeting_items WHERE meeting_id = ${id}`;
    for (const [position, item] of agenda.entries()) {
      const at = pool.findIndex((e) => e.title.toLowerCase() === item.title.toLowerCase());
      const notes = at >= 0 ? pool.splice(at, 1)[0].notes : "";
      await tx`INSERT INTO meeting_items (meeting_id, position, level, title, notes) VALUES (${id}, ${position}, ${item.level}, ${item.title}, ${notes})`;
    }
  });
  refresh(id);
  redirect(`${BASE}/meetings/${id}`);
}

const statusSchema = z.enum(["open", "done", "locked"]);

/** Marks a meeting open, done or locked. Once locked, only an admin can change it again. */
export async function setMeetingStatus(meetingId: string, status: string): Promise<void> {
  const id = uuid.parse(meetingId);
  const { session } = await requireMeetingAccess(id);
  const next = statusSchema.parse(status);
  const isAdmin = session.user.role === "admin";

  // One statement, so a lock cannot be undone by a request that raced it.
  const changed = await sql`
    UPDATE meetings SET minutes_status = ${next}
    WHERE id = ${id} AND (minutes_status <> 'locked' OR minutes_status = ${next} OR ${isAdmin}) RETURNING id
  `;
  if (changed.length === 0) throw new Error("Only an admin can reopen a locked meeting.");
  if (next === "locked") await sql`UPDATE meeting_items SET locked_by = NULL, locked_at = NULL WHERE meeting_id = ${id}`;
  refresh(id);
}

/** Loads an item and checks the caller may edit its meeting. */
async function requireItemAccess(itemId: string) {
  const session = await requireSignedIn();
  const [row] = await sql<{ meeting_id: string; committee_id: string; minutes_status: MeetingStatus }[]>`
    SELECT i.meeting_id, m.committee_id, m.minutes_status FROM meeting_items i JOIN meetings m ON m.id = i.meeting_id WHERE i.id = ${itemId}
  `;
  if (!row || !(await isCommitteeMember(session.user, row.committee_id))) throw new Error("Not allowed.");
  return { userId: session.user.id, meetingId: row.meeting_id, locked: row.minutes_status === "locked" };
}

/** The lock is free, expired or already ours. Used by both locking and saving so they cannot disagree. */
const lockAvailable = (userId: string) =>
  sql`(locked_by IS NULL OR locked_by = ${userId} OR locked_at IS NULL OR locked_at < NOW() - make_interval(secs => ${LOCK_SECONDS}))`;

/** Takes or renews the lock on one item. Returns false when a colleague holds it. */
export async function acquireItemLock(itemId: string): Promise<boolean> {
  const id = uuid.parse(itemId);
  const { userId, locked } = await requireItemAccess(id);
  if (locked) return false;
  const rows = await sql`
    UPDATE meeting_items SET locked_by = ${userId}, locked_at = NOW()
    WHERE id = ${id} AND ${lockAvailable(userId)} RETURNING id
  `;
  return rows.length > 0;
}

export async function releaseItemLock(itemId: string): Promise<void> {
  const id = uuid.parse(itemId);
  const { userId } = await requireItemAccess(id);
  await sql`UPDATE meeting_items SET locked_by = NULL, locked_at = NULL WHERE id = ${id} AND locked_by = ${userId}`;
}

/** Autosave: only succeeds while the caller holds (or can take) the lock, so two people never overwrite each other. */
export async function saveItemNotes(itemId: string, notes: string): Promise<boolean> {
  const id = uuid.parse(itemId);
  const { userId, meetingId, locked } = await requireItemAccess(id);
  if (locked) return false;
  const rows = await sql`
    UPDATE meeting_items SET notes = ${notes.slice(0, 10000)}, locked_by = ${userId}, locked_at = NOW()
    WHERE id = ${id} AND ${lockAvailable(userId)} RETURNING id
  `;
  if (rows.length === 0) return false;
  revalidatePath(`${BASE}/meetings/${meetingId}`);
  return true;
}

/* ───────────── action points ───────────── */

const actionSchema = z.object({
  id: uuid,
  body: z.string().trim().min(1).max(500),
  assignee_id: z.string().max(64),
  deadline: z.union([z.iso.date(), z.literal("")]),
});

export async function addAction(formData: FormData) {
  const data = actionSchema.parse(Object.fromEntries(formData));
  const { committeeId } = await requireEditableMeeting(data.id);
  if (data.assignee_id) {
    const [member] = await sql`SELECT 1 FROM committee_members WHERE committee_id = ${committeeId} AND user_id = ${data.assignee_id}`;
    if (!member) throw new Error("Action points can only go to committee members.");
  }
  await sql`
    INSERT INTO action_points (meeting_id, committee_id, assignee_id, body, deadline)
    VALUES (${data.id}, ${committeeId}, ${data.assignee_id || null}, ${data.body}, ${data.deadline || null})
  `;
  refresh(data.id);
}

async function requireActionAccess(actionId: string) {
  const session = await requireSignedIn();
  const [row] = await sql<{ committee_id: string; meeting_id: string; assignee_id: string | null; meeting_status: MeetingStatus }[]>`
    SELECT a.committee_id, a.meeting_id, a.assignee_id, m.minutes_status AS meeting_status
    FROM action_points a JOIN meetings m ON m.id = a.meeting_id WHERE a.id = ${actionId}
  `;
  if (!row) redirect(BASE);
  const allowed = row.assignee_id === session.user.id || (await isCommitteeMember(session.user, row.committee_id));
  if (!allowed) redirect(BASE);
  return row;
}

export async function toggleAction(formData: FormData) {
  const id = uuid.parse(formData.get("id"));
  const row = await requireActionAccess(id);
  await sql`UPDATE action_points SET is_done = NOT is_done WHERE id = ${id}`;
  refresh(row.meeting_id);
}

export async function deleteAction(formData: FormData) {
  const id = uuid.parse(formData.get("id"));
  const row = await requireActionAccess(id);
  // Assignees may tick their own points off, but only committee members may remove them.
  const session = await requireSignedIn();
  if (!(await isCommitteeMember(session.user, row.committee_id))) redirect(BASE);
  if (row.meeting_status === "locked") redirect(`${BASE}/meetings/${row.meeting_id}`);
  await sql`DELETE FROM action_points WHERE id = ${id}`;
  refresh(row.meeting_id);
}
