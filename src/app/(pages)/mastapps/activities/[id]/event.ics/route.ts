import { getCalendarActivity } from "@/lib/activities";
import { SITE_NAME, siteUrl } from "@/lib/env";
import { buildCalendar } from "@/lib/ical";

export const dynamic = "force-dynamic";

/** One activity as a calendar file ("add this event"). It shares its UID with the feed, so subscribers get no duplicate. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  try {
    const activity = await getCalendarActivity(id);
    if (!activity) return new Response("Not found", { status: 404 });
    const body = buildCalendar([activity], { name: SITE_NAME, siteUrl: siteUrl() });
    return new Response(body, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="mastatine-activity.ics"',
      },
    });
  } catch (error) {
    console.error("Failed to build the activity calendar file:", (error as Error).message);
    return new Response("The calendar file is temporarily unavailable.", { status: 503 });
  }
}
