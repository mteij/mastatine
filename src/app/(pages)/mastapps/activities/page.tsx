import type { Metadata } from "next";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import CalendarSubscribe from "@/components/CalendarSubscribe";
import { formatParticipants, getActivities } from "@/lib/activities";
import { formatDateTime } from "@/lib/datetime";
import { getSession } from "@/lib/session";
import { parseSignupGroups, priceLabel } from "@/lib/signup-options";
import { CheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Activities", description: "Everything the committees organise." };
export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const session = await getSession();
  const activities = await getActivities(session?.user.id ?? null);

  return (
    <AppFrame title="Activities" tagline={session ? "Everything the committees organise. Subscribe and show up." : "Everything the committees organise. Sign in to subscribe."}>
      <CalendarSubscribe className="mb-6 max-w-xs" />
      {activities.length === 0 ? (
        <p className="py-10 text-center text-muted">No activities yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {activities.map((a) => (
            <li key={a.id}>
              <Link href={`/mastapps/activities/${a.id}`} className={`card block h-full overflow-hidden text-ink hover:text-ink ${a.subscribed ? "!border-success" : ""}`}>
                <div className="flex items-center justify-center gap-2 border-b border-line bg-soft px-4 py-3 text-center text-lg font-bold text-accent-text">
                  {a.name}
                  {a.subscribed && <span className="text-ink" title="You are subscribed"><CheckIcon /><span className="sr-only">You are subscribed</span></span>}
                </div>
                <dl className="divide-y divide-line text-center text-sm">
                  <div className="px-4 py-2 text-muted">{formatDateTime(a.starts_at)}</div>
                  <div className="px-4 py-2">{priceLabel(a.cost_cents, parseSignupGroups(a.signup_options))}</div>
                  <div className="px-4 py-2">Participants: {formatParticipants(a)}</div>
                </dl>
                {a.poster_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.poster_url} alt={`Poster for ${a.name}`} className="w-full" loading="lazy" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppFrame>
  );
}
