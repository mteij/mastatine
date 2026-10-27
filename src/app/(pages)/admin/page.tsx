import Link from "next/link";
import sql from "@/lib/db";

export default async function AdminOverview() {
  const [stats] = await sql<{ masts: number; votes: number; users: number; confirmed: number; pending: number }[]>`
    SELECT
      (SELECT COUNT(*) FROM towers)::int AS masts,
      (SELECT COUNT(*) FROM votes)::int AS votes,
      (SELECT COUNT(*) FROM "user")::int AS users,
      (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'confirmed')::int AS confirmed,
      (SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'pending')::int AS pending
  `;

  const cards = [
    { label: "Masts", value: stats.masts, href: "/admin/masts" },
    { label: "Votes", value: stats.votes, href: "/admin/masts" },
    { label: "Users", value: stats.users, href: "/admin/users" },
    { label: "Subscribers", value: stats.confirmed, href: "/admin/newsletter", note: `${stats.pending} awaiting confirmation` },
  ];

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <li key={card.label}>
          <Link href={card.href} className="card block p-6 hover:border-accent">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-1 font-display text-4xl font-bold tabular-nums">{card.value.toLocaleString("en-US")}</p>
            {card.note && <p className="mt-1 text-sm text-muted">{card.note}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
