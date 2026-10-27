import Link from "next/link";
import sql from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { removeSubscriber } from "../actions";

interface Issue {
  id: string;
  subject: string;
  status: "draft" | "sending" | "sent";
  created_at: Date;
  sent_at: Date | null;
  sent: number;
}

interface Subscriber {
  id: string;
  email: string;
  status: string;
  created_at: Date;
}

const STATUS_STYLE: Record<string, string> = {
  confirmed: "badge",
  pending: "text-muted",
  unsubscribed: "text-muted line-through",
};

export default async function AdminNewsletter() {
  const [issues, subscribers, counts] = await Promise.all([
    sql<Issue[]>`
      SELECT n.id, n.subject, n.status, n.created_at, n.sent_at,
        (SELECT COUNT(*) FROM newsletter_sends s WHERE s.newsletter_id = n.id AND s.status = 'sent')::int AS sent
      FROM newsletters n ORDER BY n.created_at DESC LIMIT 50
    `,
    sql<Subscriber[]>`SELECT id, email, status, created_at FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 300`,
    sql<{ status: string; n: number }[]>`SELECT status, COUNT(*)::int AS n FROM newsletter_subscribers GROUP BY status`,
  ]);
  const count = (status: string) => counts.find((c) => c.status === status)?.n ?? 0;

  return (
    <div className="space-y-12">
      <section aria-labelledby="issues-title">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="issues-title" className="text-xl font-bold">Issues</h2>
          <Link href="/admin/newsletter/new" className="btn btn-primary">New issue</Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Subject</th><th>Status</th><th className="text-right">Delivered</th><th>Created</th></tr></thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td><Link href={`/admin/newsletter/${issue.id}`} className="font-medium hover:text-accent-text">{issue.subject}</Link></td>
                  <td><span className={issue.status === "draft" ? "text-muted" : "badge"}>{issue.status}</span></td>
                  <td className="text-right tabular-nums">{issue.sent}</td>
                  <td className="whitespace-nowrap text-muted">{new Date(issue.created_at).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
              {issues.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-muted">No issues yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="subs-title">
        <h2 id="subs-title" className="text-xl font-bold">Subscribers</h2>
        <p className="mt-1 text-sm text-muted">
          {count("confirmed")} confirmed · {count("pending")} awaiting confirmation · {count("unsubscribed")} unsubscribed. Only confirmed
          subscribers receive issues.
        </p>
        <div className="table-wrap mt-5">
          <table className="table">
            <thead><tr><th>Email</th><th>Status</th><th>Added</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <td>{s.email}</td>
                  <td><span className={STATUS_STYLE[s.status]}>{s.status}</span></td>
                  <td className="whitespace-nowrap text-muted">{new Date(s.created_at).toLocaleDateString("en-GB")}</td>
                  <td className="text-right">
                    <form action={removeSubscriber}>
                      <input type="hidden" name="id" value={s.id} />
                      <ConfirmButton message={`Permanently remove ${s.email}?`} className="btn btn-danger btn-sm">Remove</ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-muted">No subscribers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
