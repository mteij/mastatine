import Link from "next/link";
import sql from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { AUDIENCE_LABEL, parseAudience } from "@/lib/newsletter-audience";
import { removeSubscriber } from "../actions";
import { requireAdmin } from "@/lib/session";

interface Issue {
  id: string;
  subject: string;
  status: "draft" | "sending" | "sent";
  audience: string;
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
  // Layouts do not re-run on client navigation, so each admin page checks the role itself.
  await requireAdmin();
  const [issues, subscribers, counts] = await Promise.all([
    sql<Issue[]>`
      SELECT n.id, n.subject, n.status, n.audience, n.created_at, n.sent_at,
        (SELECT COUNT(*) FROM newsletter_sends s WHERE s.newsletter_id = n.id AND s.status = 'sent')::int AS sent
      FROM newsletters n ORDER BY n.created_at DESC LIMIT 50
    `,
    sql<Subscriber[]>`SELECT id, email, status, created_at FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 300`,
    sql<{ status: string; n: number }[]>`SELECT status, COUNT(*)::int AS n FROM newsletter_subscribers GROUP BY status`,
  ]);
  const count = (status: string) => counts.find((c) => c.status === status)?.n ?? 0;

  return (
    <div className="space-y-5">
      <section aria-labelledby="issues-title">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="issues-title" className="text-base font-extrabold">Issues</h2>
          <Link href="/admin/newsletter/new" className="btn btn-primary btn-sm">New issue</Link>
        </div>
        <div className="table-wrap">
          <table className="table table-stack">
            <thead><tr><th>Subject</th><th>To</th><th>Status</th><th className="text-right">Delivered</th><th>Created</th></tr></thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td data-primary><Link href={`/admin/newsletter/${issue.id}`} className="font-medium hover:text-accent-text">{issue.subject}</Link></td>
                  <td data-label="To" className="whitespace-nowrap text-sm text-muted">{AUDIENCE_LABEL[parseAudience(issue.audience)]}</td>
                  <td data-label="Status"><span className={issue.status === "draft" ? "text-muted" : "badge"}>{issue.status}</span></td>
                  <td data-label="Delivered" className="text-right tabular-nums">{issue.sent}</td>
                  <td data-label="Created" className="whitespace-nowrap text-muted">{new Date(issue.created_at).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
              {issues.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted">No issues yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="subs-title">
        <h2 id="subs-title" className="text-base font-extrabold">Subscribers</h2>
        <p className="mt-1 text-sm text-muted">
          {count("confirmed")} confirmed · {count("pending")} pending · {count("unsubscribed")} unsubscribed
        </p>
        <div className="table-wrap mt-2">
          <table className="table table-stack">
            <thead><tr><th>Email</th><th>Status</th><th>Added</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <td data-primary>{s.email}</td>
                  <td data-label="Status"><span className={STATUS_STYLE[s.status]}>{s.status}</span></td>
                  <td data-label="Added" className="whitespace-nowrap text-muted">{new Date(s.created_at).toLocaleDateString("en-GB")}</td>
                  <td className="text-right">
                    <form action={removeSubscriber}>
                      <input type="hidden" name="id" value={s.id} />
                      <ConfirmButton message={`Permanently remove ${s.email}?`} className="btn btn-danger btn-sm">Remove</ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-muted">No subscribers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
