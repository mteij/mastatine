import { siteUrl } from "@/lib/env";

/** "Add to your calendar": subscribes to the public /calendar.ics feed. Works without JavaScript. */
export default function CalendarSubscribe({ className = "" }: { className?: string }) {
  const feed = `${siteUrl()}/calendar.ics`;
  const webcal = feed.replace(/^https?:/, "webcal:");
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;

  return (
    <details className={`cal-sub ${className}`}>
      <summary>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        Add to your calendar
      </summary>
      <ul>
        <li><a href={webcal}>Apple, Outlook or other app</a></li>
        <li><a href={google} target="_blank" rel="noopener noreferrer">Google Calendar<span className="sr-only"> (opens in a new tab)</span></a></li>
        <li><a href="/calendar.ics" download>Download .ics file</a></li>
      </ul>
      <p>Subscribing keeps new activities in your calendar up to date.</p>
    </details>
  );
}
