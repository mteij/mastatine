import Link from "next/link";
import CalendarSubscribe from "@/components/CalendarSubscribe";
import { getUpcomingActivities } from "@/lib/activities";
import { formatDayNumber, formatMonthShort, formatTime } from "@/lib/datetime";

const AGENDA_ITEMS = 4;

/** Next few activities for the desktop sidebar. Public: name, time and place only. */
export default async function SidebarAgenda() {
  const upcoming = await getUpcomingActivities(AGENDA_ITEMS).catch((error) => {
    console.error("Failed to load the sidebar agenda:", (error as Error).message);
    return [];
  });

  return (
    <section className="agenda" aria-labelledby="agenda-title">
      <h3 id="agenda-title" className="widget-title"><span>Agenda</span></h3>
      {upcoming.length === 0 ? (
        <p className="agenda__empty">Nothing planned right now.</p>
      ) : (
        <ul className="agenda__list">
          {upcoming.map((a) => (
            <li key={a.id}>
              <Link href={`/mastapps/activities/${a.id}`} className="agenda__item">
                <time className="agenda__date" dateTime={a.starts_at.toISOString()}>
                  <span className="agenda__day">{formatDayNumber(a.starts_at)}</span>
                  <span className="agenda__month">{formatMonthShort(a.starts_at)}</span>
                </time>
                <span className="agenda__text">
                  <span className="agenda__name">{a.name}</span>
                  <span className="agenda__meta">{formatTime(a.starts_at)}{a.location ? ` · ${a.location}` : ""}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/mastapps/activities" className="agenda__all">All activities &rarr;</Link>
      <CalendarSubscribe />
    </section>
  );
}
