import CalendarDialog from "@/components/CalendarDialog";
import { siteUrl } from "@/lib/env";

/** "Add to your calendar": opens a pop-up with ways to subscribe to the public /calendar.ics feed. */
export default function CalendarSubscribe({ className = "" }: { className?: string }) {
  const webcal = `${siteUrl()}/calendar.ics`.replace(/^https?:/, "webcal:");
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
  return <CalendarDialog webcal={webcal} google={google} className={className} />;
}
