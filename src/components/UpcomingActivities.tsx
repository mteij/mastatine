import Link from "next/link";
import ActivityCountdown from "@/components/ActivityCountdown";
import { getUpcomingActivities } from "@/lib/activities";
import { formatDateTime } from "@/lib/datetime";

/** Compact chip for the next activity with a live countdown, meant to float over the hero image. Public: name and time only. */
export default async function UpcomingActivities() {
  const [next] = await getUpcomingActivities(1).catch((error) => {
    console.error("Failed to load upcoming activities:", (error as Error).message);
    return [];
  });
  if (!next) return null;

  const when = formatDateTime(next.starts_at);

  return (
    <Link href={`/mastapps/activities/${next.id}`} className="nx" title={`${next.name} · ${when}`}>
      <span className="nx__label">Next</span>
      <span className="nx__name">{next.name}</span>
      <span className="nx__when">
        <ActivityCountdown startsAt={next.starts_at.toISOString()} endsAt={next.ends_at?.toISOString() ?? null} fallback={when} />
      </span>
    </Link>
  );
}
