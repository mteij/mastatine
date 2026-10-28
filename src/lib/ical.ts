import type { UpcomingActivity } from "@/lib/activities";

/** Events without an end time are shown as lasting this long. */
const DEFAULT_DURATION_MS = 3 * 60 * 60 * 1000;
const MAX_LINE_OCTETS = 75;

const encoder = new TextEncoder();

/** RFC 5545 TEXT escaping. */
function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** UTC form: 20261028T180000Z */
function utc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Folds a content line at 75 octets without splitting a multi-byte character. */
function fold(line: string): string {
  if (encoder.encode(line).length <= MAX_LINE_OCTETS) return line;
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const char of line) {
    const width = encoder.encode(char).length;
    // Continuation lines start with a space, which counts toward their 75 octets.
    const limit = parts.length === 0 ? MAX_LINE_OCTETS : MAX_LINE_OCTETS - 1;
    if (size + width > limit) {
      parts.push(current);
      current = "";
      size = 0;
    }
    current += char;
    size += width;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export interface CalendarOptions {
  name: string;
  siteUrl: string;
  now?: Date;
}

/** Builds a public iCalendar feed: name, time, place and organising committee only, plus a link to the activity. */
export function buildCalendar(activities: UpcomingActivity[], { name, siteUrl, now = new Date() }: CalendarOptions): string {
  const host = new URL(siteUrl).hostname;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${name}//Activities//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    "X-WR-TIMEZONE:Europe/Amsterdam",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const a of activities) {
    const end = a.ends_at ?? new Date(a.starts_at.getTime() + DEFAULT_DURATION_MS);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${a.id}@${host}`,
      `DTSTAMP:${utc(now)}`,
      `DTSTART:${utc(a.starts_at)}`,
      `DTEND:${utc(end)}`,
      `SUMMARY:${escapeText(a.name)}`,
      ...(a.location ? [`LOCATION:${escapeText(a.location)}`] : []),
      `DESCRIPTION:${escapeText(`Organised by ${a.committee_name}.`)}`,
      `URL:${siteUrl}/mastapps/activities/${a.id}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
