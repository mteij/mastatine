import Link from "next/link";
import sql from "@/lib/db";
import { formatDateTime } from "@/lib/datetime";
import { requireAdmin } from "@/lib/session";

const WEEKS = 8;

interface Stats {
  masts: number;
  votes: number;
  users: number;
  confirmed: number;
  pending: number;
  committees: number;
  upcoming: number;
  open_actions: number;
  member_requests: number;
}

export default async function AdminOverview() {
  // Layouts do not re-run on client navigation, so each admin page checks the role itself.
  await requireAdmin();
  const [[stats], weekly, upcoming, newest, topMasts, committees] = await Promise.all([
    sql<Stats[]>`
      SELECT
        (SELECT COUNT(*) FROM towers)::int AS masts,
        (SELECT COUNT(*) FROM votes)::int AS votes,
        (SELECT COUNT(*) FROM "user")::int AS users,
        (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'confirmed')::int AS confirmed,
        (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'pending')::int AS pending,
        (SELECT COUNT(*) FROM committees)::int AS committees,
        (SELECT COUNT(*) FROM activities WHERE starts_at > NOW())::int AS upcoming,
        (SELECT COUNT(*) FROM action_points WHERE NOT is_done)::int AS open_actions,
        (SELECT COUNT(*) FROM "user" WHERE member_status = 'pending')::int AS member_requests
    `,
    sql<{ week: Date; n: number }[]>`
      SELECT w.week, COUNT(u.id)::int AS n
      FROM generate_series(date_trunc('week', NOW()) - make_interval(weeks => ${WEEKS - 1}), date_trunc('week', NOW()), '1 week') AS w(week)
      LEFT JOIN "user" u ON date_trunc('week', u."createdAt") = w.week
      GROUP BY w.week ORDER BY w.week
    `,
    sql<{ id: string; name: string; starts_at: Date; committee: string; participants: number; subscription_limit: number | null }[]>`
      SELECT a.id, a.name, a.starts_at, c.name AS committee, a.subscription_limit,
        (SELECT COUNT(*) FROM activity_subscriptions s WHERE s.activity_id = a.id)::int AS participants
      FROM activities a JOIN committees c ON c.id = a.committee_id
      WHERE a.starts_at > NOW() ORDER BY a.starts_at LIMIT 5
    `,
    sql<{ id: string; name: string; email: string; createdAt: Date }[]>`SELECT id, name, email, "createdAt" FROM "user" ORDER BY "createdAt" DESC LIMIT 5`,
    sql<{ id: string; title: string; vote_count: number }[]>`SELECT id, title, vote_count FROM towers ORDER BY vote_count DESC, created_at DESC LIMIT 5`,
    sql<{ id: string; name: string; members: number }[]>`
      SELECT c.id, c.name, COUNT(m.user_id)::int AS members
      FROM committees c LEFT JOIN committee_members m ON m.committee_id = c.id GROUP BY c.id ORDER BY c.name
    `,
  ]);

  const cards = [
    {
      label: "Users",
      value: stats.users,
      href: stats.member_requests > 0 ? "/admin/users?filter=requests" : "/admin/users",
      note: stats.member_requests > 0
        ? `${stats.member_requests} membership ${stats.member_requests === 1 ? "request" : "requests"} to review`
        : `${weekly[weekly.length - 1]?.n ?? 0} new this week`,
    },
    { label: "Newsletter", value: stats.confirmed, href: "/admin/newsletter", note: `${stats.pending} awaiting confirmation` },
    { label: "Upcoming activities", value: stats.upcoming, href: "/mastapps/activities/mine" },
    { label: "Open action points", value: stats.open_actions, href: "/mastapps/minutes/actions" },
    { label: "Masts", value: stats.masts, href: "/admin/masts", note: `${stats.votes.toLocaleString("en-US")} votes` },
    { label: "Committees", value: stats.committees, href: "/admin/committees" },
  ];
  const peak = Math.max(1, ...weekly.map((w) => w.n));

  return (
    <div className="space-y-8">
      <ul className="grid gap-5 @xl:grid-cols-2 @3xl:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label}>
            <Link href={card.href} className="card block h-full p-6 hover:border-accent">
              <p className="text-sm text-muted">{card.label}</p>
              <p className="mt-1 font-display text-4xl font-bold tabular-nums">{card.value.toLocaleString("en-US")}</p>
              {card.note && <p className="mt-1 text-sm text-muted">{card.note}</p>}
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-5 @3xl:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-lg font-extrabold">New users per week</h2>
          <ol className="mt-4 flex h-40 items-end gap-2" aria-label="New users per week, oldest first">
            {weekly.map((w) => (
              <li key={w.week.toISOString()} className="flex h-full flex-1 flex-col justify-end text-center" title={`Week of ${w.week.toLocaleDateString("en-GB")}: ${w.n}`}>
                <span className="text-xs tabular-nums text-muted">{w.n}</span>
                <span className="block rounded-t-md bg-accent" style={{ height: `${Math.max(4, (w.n / peak) * 100)}%` }} />
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-muted">Last {WEEKS} weeks</p>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-extrabold">Committees</h2>
          <ul className="mt-3 divide-y divide-line">
            {committees.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <Link href="/admin/committees" className="font-medium text-ink hover:text-accent-text">{c.name}</Link>
                <span className="badge">{c.members} {c.members === 1 ? "member" : "members"}</span>
              </li>
            ))}
            {committees.length === 0 && <li className="py-2 text-muted">No committees yet.</li>}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-extrabold">Coming up</h2>
          <ul className="mt-3 divide-y divide-line">
            {upcoming.map((a) => (
              <li key={a.id} className="py-2">
                <Link href={`/mastapps/activities/${a.id}`} className="font-medium text-ink hover:text-accent-text">{a.name}</Link>
                <p className="text-sm text-muted">
                  {formatDateTime(a.starts_at)} · {a.committee} · {a.participants} / {a.subscription_limit ?? "∞"} subscribed
                </p>
              </li>
            ))}
            {upcoming.length === 0 && <li className="py-2 text-muted">No upcoming activities.</li>}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-extrabold">Newest users</h2>
          <ul className="mt-3 divide-y divide-line">
            {newest.map((u) => (
              <li key={u.id} className="flex items-baseline justify-between gap-3 py-2">
                <span className="min-w-0 truncate"><span className="font-medium">{u.name || "No name"}</span> <span className="text-sm text-muted">{u.email}</span></span>
                <span className="shrink-0 text-sm text-muted">{new Date(u.createdAt).toLocaleDateString("en-GB")}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6 @3xl:col-span-2">
          <h2 className="text-lg font-extrabold">Top masts</h2>
          <ol className="mt-3 divide-y divide-line">
            {topMasts.map((m, i) => (
              <li key={m.id} className="flex items-center justify-between py-2">
                <span><span className="mr-3 tabular-nums text-muted">{i + 1}</span>{m.title}</span>
                <span className="badge tabular-nums">{m.vote_count.toLocaleString("en-US")} votes</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
