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
        ? `${stats.member_requests} to review`
        : `${weekly[weekly.length - 1]?.n ?? 0} new this week`,
    },
    { label: "Newsletter", value: stats.confirmed, href: "/admin/newsletter", note: `${stats.pending} unconfirmed` },
    { label: "Upcoming", value: stats.upcoming, href: "/mastapps/activities/mine", note: "activities" },
    { label: "Open actions", value: stats.open_actions, href: "/mastapps/minutes?actions=committee", note: "action points" },
    { label: "Masts", value: stats.masts, href: "/admin/masts", note: `${stats.votes.toLocaleString("en-US")} votes` },
    { label: "Committees", value: stats.committees, href: "/admin/committees" },
  ];
  const peak = Math.max(1, ...weekly.map((w) => w.n));

  return (
    <div className="space-y-4">
      {stats.member_requests > 0 && (
        <Link href="/admin/users?filter=requests" className="card flex flex-wrap items-center justify-between gap-2 border-accent !p-2.5 hover:bg-accent-soft">
          <span className="text-sm font-extrabold">
            {stats.member_requests} membership {stats.member_requests === 1 ? "request is" : "requests are"} waiting for you
          </span>
          <span className="btn btn-primary btn-sm">Review</span>
        </Link>
      )}

      <ul className="grid grid-cols-2 gap-2 @xl:grid-cols-3 @4xl:grid-cols-6">
        {cards.map((card) => (
          <li key={card.label}>
            <Link href={card.href} className="card flex h-full items-baseline justify-between gap-2 !p-2.5 hover:border-accent @4xl:block">
              <span className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide text-muted">{card.label}</span>
                {card.note && <span className="block truncate text-xs text-muted">{card.note}</span>}
              </span>
              <span className="text-2xl font-bold tabular-nums">{card.value.toLocaleString("en-US")}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 @3xl:grid-cols-2">
        <section aria-labelledby="coming-title">
          <h2 id="coming-title" className="mb-1 text-sm font-extrabold">Coming up</h2>
          <div className="table-open">
            <table className="table">
              <thead><tr><th>Activity</th><th>When</th><th className="text-right">Going</th></tr></thead>
              <tbody>
                {upcoming.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium"><Link href={`/mastapps/activities/${a.id}`} className="hover:text-accent-text">{a.name}</Link><span className="block text-xs font-normal text-muted">{a.committee}</span></td>
                    <td className="whitespace-nowrap text-muted">{formatDateTime(a.starts_at)}</td>
                    <td className="whitespace-nowrap text-right tabular-nums">{a.participants} / {a.subscription_limit ?? "∞"}</td>
                  </tr>
                ))}
                {upcoming.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-muted">No upcoming activities.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="newest-title">
          <h2 id="newest-title" className="mb-1 text-sm font-extrabold">Newest users</h2>
          <div className="table-open">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th className="text-right">Joined</th></tr></thead>
              <tbody>
                {newest.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name || "No name"}</td>
                    <td className="max-w-[12rem] truncate text-muted" title={u.email}>{u.email}</td>
                    <td className="whitespace-nowrap text-right text-muted">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="masts-title">
          <h2 id="masts-title" className="mb-1 text-sm font-extrabold">Top masts</h2>
          <div className="table-open">
            <table className="table">
              <thead><tr><th className="w-8">#</th><th>Mast</th><th className="text-right">Votes</th></tr></thead>
              <tbody>
                {topMasts.map((m, i) => (
                  <tr key={m.id}>
                    <td className="tabular-nums text-muted">{i + 1}</td>
                    <td className="font-medium">{m.title}</td>
                    <td className="text-right tabular-nums">{m.vote_count.toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="committees-title">
          <h2 id="committees-title" className="mb-1 text-sm font-extrabold">Committees</h2>
          <div className="table-open">
            <table className="table">
              <thead><tr><th>Committee</th><th className="text-right">Members</th></tr></thead>
              <tbody>
                {committees.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium"><Link href="/admin/committees" className="hover:text-accent-text">{c.name}</Link></td>
                    <td className="text-right tabular-nums">{c.members}</td>
                  </tr>
                ))}
                {committees.length === 0 && <tr><td colSpan={2} className="py-4 text-center text-muted">No committees yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="signups-title" className="@3xl:col-span-2">
          <h2 id="signups-title" className="mb-1 text-sm font-extrabold">New users, last {WEEKS} weeks</h2>
          <div className="card !p-3">
            <ol className="flex h-24 items-end gap-2" aria-label="New users per week, oldest first">
              {weekly.map((w) => (
                <li key={w.week.toISOString()} className="flex h-full flex-1 flex-col justify-end text-center" title={`Week of ${w.week.toLocaleDateString("en-GB")}: ${w.n}`}>
                  <span className="text-xs tabular-nums text-muted">{w.n}</span>
                  <span className="block rounded-t-md bg-accent" style={{ height: `${Math.max(4, (w.n / peak) * 100)}%` }} />
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
