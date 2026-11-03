import sql from "@/lib/db";

export type ActivityEventKind = "subscribed" | "unsubscribed" | "waitlisted";

/** Counts a signup, unsubscribe or waitlist join for the statistics. Records the activity only, never the person. */
export async function logActivityEvent(activityId: string, kind: ActivityEventKind): Promise<void> {
  try {
    await sql`INSERT INTO activity_events (activity_id, kind) VALUES (${activityId}, ${kind})`;
  } catch (error) {
    console.error("Failed to record an activity event:", (error as Error).message);
  }
}
