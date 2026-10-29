/** Open: being worked on. Done: held and finished. Locked: read-only; only an admin can reopen it. */
export type MeetingStatus = "open" | "done" | "locked";

export const STATUS_LABEL: Record<MeetingStatus, string> = { open: "open", done: "done", locked: "locked" };

export function formatDeadline(deadline: string | null): string {
  if (!deadline) return "Next meeting";
  return new Date(`${deadline}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "long", timeZone: "UTC" });
}

export const isOverdue = (deadline: string | null): boolean => !!deadline && deadline < new Date().toISOString().slice(0, 10);
