interface CalEvent {
  title: string;
  location?: string;
}

export interface CalDay {
  date: string;
  events: CalEvent[];
}

function unfold(raw: string): string[] {
  return raw.replace(/\r\n[ \t]/g, "").replace(/\r\n/g, "\n").split("\n");
}

function parseIcalDate(val: string): Date | null {
  const m = val.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return null;
  return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
}

function formatDate(d: Date): string {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export async function getThisWeekActivities(): Promise<CalDay[]> {
  const calId = "qi338npaabua9qmtf6og12tmtc@group.calendar.google.com";
  const url = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calId)}/public/basic.ics`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const raw = await res.text();
    const lines = unfold(raw);

    const events: { date: Date; title: string; location?: string }[] = [];
    let inEvent = false;
    let cur: { title?: string; location?: string; start?: Date } = {};

    for (const line of lines) {
      if (line === "BEGIN:VEVENT") {
        inEvent = true;
        cur = {};
      } else if (line === "END:VEVENT") {
        if (inEvent && cur.start && cur.title) {
          events.push({ date: cur.start, title: cur.title, location: cur.location });
        }
        inEvent = false;
        cur = {};
      } else if (inEvent) {
        if (line.startsWith("SUMMARY:")) {
          cur.title = line.slice(8).trim();
        } else if (line.startsWith("DTSTART")) {
          const val = line.split(":").slice(1).join(":");
          const parsed = parseIcalDate(val);
          if (parsed) cur.start = parsed;
        } else if (line.startsWith("LOCATION:")) {
          const loc = line.slice(9).trim();
          if (loc) cur.location = loc;
        }
      }
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const thisWeek = events
      .filter((e) => e.date >= now && e.date < weekEnd)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const byDate = new Map<string, CalEvent[]>();
    for (const e of thisWeek) {
      const key = formatDate(e.date);
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push({ title: e.title, location: e.location });
    }

    return Array.from(byDate.entries()).map(([date, evs]) => ({ date, events: evs }));
  } catch {
    return [];
  }
}
