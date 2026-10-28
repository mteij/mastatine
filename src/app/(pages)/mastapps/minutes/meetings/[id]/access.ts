import { notFound, redirect } from "next/navigation";
import { getMeeting } from "@/lib/meetings";
import { requireUser } from "@/lib/session";

/** Signed-in user plus the meeting, or a 404 when it does not exist or belongs to a committee they are not on. */
export async function loadMeeting(params: Promise<{ id: string }>) {
  const { user } = await requireUser();
  const { id } = await params;
  const meeting = /^[0-9a-f-]{36}$/i.test(id) ? await getMeeting(id, user) : null;
  if (!meeting) notFound();
  return { user, meeting };
}

/** Like loadMeeting, but a locked meeting is read-only: its edit pages send you back to the meeting. */
export async function loadEditableMeeting(params: Promise<{ id: string }>) {
  const loaded = await loadMeeting(params);
  if (loaded.meeting.minutes_status === "locked") redirect(`/mastapps/minutes/meetings/${loaded.meeting.id}`);
  return loaded;
}
