import { getCalendarActivities } from "@/lib/activities";
import { SITE_NAME, siteUrl } from "@/lib/env";
import { buildCalendar } from "@/lib/ical";

export const dynamic = "force-dynamic";

/** Public calendar feed that members can subscribe to from Apple, Google or Outlook Calendar. */
export async function GET() {
  try {
    const body = buildCalendar(await getCalendarActivities(), { name: SITE_NAME, siteUrl: siteUrl() });
    return new Response(body, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="mastatine.ics"',
        "Cache-Control": "public, max-age=900, s-maxage=900",
      },
    });
  } catch (error) {
    console.error("Failed to build the calendar feed:", (error as Error).message);
    return new Response("The calendar is temporarily unavailable.", { status: 503, headers: { "Retry-After": "300" } });
  }
}
