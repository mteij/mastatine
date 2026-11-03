import type { Metadata } from "next";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import { getActivityStats, summarise, type ActivityStat } from "@/lib/activity-stats";
import { formatDateTime } from "@/lib/datetime";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Activity statistics", robots: { index: false } };
export const dynamic = "force-dynamic";

const percent = (share: number | null) => (share === null ? "–" : `${Math.round(share * 100)}%`);

function Tile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function StatsTable({ title, rows }: { title: string; rows: ActivityStat[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <div className="table-wrap">
        <table className="table table-stack">
          <thead>
            <tr>
              <th>Activity</th><th>Committee</th><th>Start</th><th>Going</th><th>Fill</th><th>Waitlist</th><th>New this week</th><th>Unsubscribed</th><th>Messages</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td data-primary><Link href={`/mastapps/activities/${s.id}`} className="font-medium">{s.name}</Link></td>
                <td data-label="Committee">{s.committee_name}</td>
                <td data-label="Start">{formatDateTime(s.starts_at)}</td>
                <td data-label="Going" className="tabular-nums">{s.going}{s.subscription_limit ? ` / ${s.subscription_limit}` : ""}</td>
                <td data-label="Fill" className="tabular-nums">{s.subscription_limit ? percent(Math.min(1, s.going / s.subscription_limit)) : "–"}</td>
                <td data-label="Waitlist" className="tabular-nums">{s.waitlist}</td>
                <td data-label="New this week" className="tabular-nums">{s.signups_7d}</td>
                <td data-label="Unsubscribed" className="tabular-nums">{s.unsubscribed}</td>
                <td data-label="Messages" className="tabular-nums">{s.messages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function ActivityStatsPage() {
  const { user } = await requireUser();
  const stats = await getActivityStats(user);
  const now = new Date();
  const summary = summarise(stats, now);

  return (
    <AppFrame title="Activity statistics" tagline="How people sign up for your committees' activities. Only counts, never names.">
      {stats.length === 0 ? (
        <p className="card p-8 text-center text-muted">Nothing to count yet. <Link href="/mastapps/activities/new" className="font-bold text-accent-text underline">Create an activity</Link>.</p>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tile label="Upcoming activities" value={summary.upcoming} />
            <Tile label="Signed up for those" value={summary.signedUpForUpcoming} hint={summary.waitlisted ? `${summary.waitlisted} more on waitlists` : undefined} />
            <Tile label="Average fill, past activities" value={percent(summary.averageFill)} hint="Only activities with a limit" />
            <Tile label="Unsubscribe rate" value={percent(summary.unsubscribeRate)} hint="Counted since this page was introduced" />
          </div>
          <StatsTable title="Upcoming" rows={stats.filter((s) => s.starts_at > now).reverse()} />
          <StatsTable title="Past" rows={stats.filter((s) => s.starts_at <= now)} />
        </div>
      )}
    </AppFrame>
  );
}
