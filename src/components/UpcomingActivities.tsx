import Link from "next/link";
import { getUpcomingActivities } from "@/lib/activities";
import { formatDateTime } from "@/lib/datetime";

/** The next activities, with the very next one featured. Public: only name, time, place and committee are shown. */
export default async function UpcomingActivities() {
  const [next, ...later] = await getUpcomingActivities(3).catch((error) => {
    console.error("Failed to load upcoming activities:", (error as Error).message);
    return [];
  });
  if (!next) return null;

  return (
    <section className="up-act" aria-labelledby="up-act-title">
      <div className="up-act__inside">
        <h2 id="up-act-title" className="up-act__title">Upcoming activities</h2>
        <Link href={`/mastapps/activities/${next.id}`} className="up-act__next">
          <span className="up-act__badge">Next up</span>
          <span className="up-act__name">{next.name}</span>
          <span className="up-act__when">{formatDateTime(next.starts_at)}</span>
          <span className="up-act__where">
            {next.location ? `${next.location} · ` : ""}
            {next.committee_name}
          </span>
        </Link>
        {later.length > 0 && (
          <ul className="up-act__later">
            {later.map((a) => (
              <li key={a.id}>
                <Link href={`/mastapps/activities/${a.id}`}>
                  <span className="up-act__later-name">{a.name}</span>
                  <span className="up-act__later-when">{formatDateTime(a.starts_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/mastapps/activities" className="up-act__all">All activities &rarr;</Link>
      </div>
    </section>
  );
}
