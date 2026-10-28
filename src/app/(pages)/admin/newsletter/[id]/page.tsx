import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import sql from "@/lib/db";
import AutoRefresh from "@/components/admin/AutoRefresh";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { PARODY_NOTICE, textToHtml } from "@/lib/email-templates";
import { issueStats } from "@/lib/newsletter";
import { deleteIssue, saveIssue, sendTest, startSending } from "../../actions";
import { requireAdmin } from "@/lib/session";

interface Issue {
  id: string;
  subject: string;
  body: string;
  status: "draft" | "sending" | "sent";
  sent_at: Date | null;
}

const NOTICES: Record<string, { text: string; tone: "ok" | "bad" }> = {
  saved: { text: "Draft saved.", tone: "ok" },
  "test-sent": { text: "Test email sent to your address.", tone: "ok" },
  "test-failed": { text: "The test email could not be sent. Check the SMTP settings.", tone: "bad" },
  sending: { text: "Sending started. This page updates as emails go out.", tone: "ok" },
  "no-recipients": { text: "There are no confirmed subscribers to send to.", tone: "bad" },
};

export default async function IssuePage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  // Layouts do not re-run on client navigation, so each admin page checks the role itself.
  await requireAdmin();
  const { id } = await props.params;
  const { notice } = await props.searchParams;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const [issue] = await sql<Issue[]>`SELECT id, subject, body, status, sent_at FROM newsletters WHERE id = ${id}`;
  if (!issue) notFound();

  const stats = await issueStats(id);
  const message = notice ? NOTICES[notice] : undefined;
  const isDraft = issue.status === "draft";

  return (
    <div className="grid gap-10 @3xl:grid-cols-2">
      {issue.status === "sending" && <AutoRefresh />}

      <div>
        <Link href="/admin/newsletter" className="text-sm font-medium text-accent-text hover:underline">&larr; Newsletter</Link>
        <h2 className="mt-3 text-2xl font-bold">{issue.subject}</h2>

        {message && (
          <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-sm ${message.tone === "ok" ? "bg-accent-soft text-accent-text" : "bg-danger/10 text-danger"}`}>
            {message.text}
          </p>
        )}

        <div className="card mt-6 p-5">
          <p className="text-sm text-muted">Status</p>
          <p className="mt-1 text-lg font-bold capitalize">{issue.status}</p>
          <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div><dt className="text-muted">Delivered</dt><dd className="text-2xl font-bold tabular-nums">{stats.sent}</dd></div>
            <div><dt className="text-muted">Failed</dt><dd className="text-2xl font-bold tabular-nums">{stats.failed}</dd></div>
            <div><dt className="text-muted">Remaining</dt><dd className="text-2xl font-bold tabular-nums">{isDraft ? stats.recipients : stats.pending}</dd></div>
          </dl>
        </div>

        {isDraft ? (
          <form action={saveIssue} className="card mt-6 space-y-5 p-6">
            <input type="hidden" name="id" value={issue.id} />
            <div>
              <label className="label" htmlFor="subject">Subject</label>
              <input id="subject" name="subject" className="input" defaultValue={issue.subject} required maxLength={150} />
            </div>
            <div>
              <label className="label" htmlFor="body">Message</label>
              <textarea id="body" name="body" className="input min-h-64 font-mono" defaultValue={issue.body} required maxLength={20000} />
            </div>
            <button type="submit" className="btn btn-secondary">Save draft</button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-muted">This issue is {issue.status === "sent" ? "sent" : "being sent"} and can no longer be edited.</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <form action={sendTest}>
            <input type="hidden" name="id" value={issue.id} />
            <button type="submit" className="btn btn-secondary">Send test to me</button>
          </form>
          {issue.status !== "sent" && (
            <form action={startSending}>
              <input type="hidden" name="id" value={issue.id} />
              <ConfirmButton
                className="btn btn-primary"
                message={`Send “${issue.subject}” to ${stats.recipients} confirmed subscriber${stats.recipients === 1 ? "" : "s"}? This cannot be undone.`}
              >
                {isDraft ? `Send to ${stats.recipients} subscribers` : "Resume sending"}
              </ConfirmButton>
            </form>
          )}
          {isDraft && (
            <form action={deleteIssue}>
              <input type="hidden" name="id" value={issue.id} />
              <ConfirmButton message="Delete this draft?" className="btn btn-danger">Delete draft</ConfirmButton>
            </form>
          )}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-muted">Preview</p>
        <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white text-[#0f1b2d]">
          <div className="bg-[#0f1b2d] px-6 py-4 font-bold text-white">S.A. Mastatine</div>
          <div className="space-y-4 p-6">
            <h3 className="text-xl font-bold">{issue.subject}</h3>
            {/* textToHtml escapes all input; only its own paragraph/link markup is emitted. */}
            <div dangerouslySetInnerHTML={{ __html: textToHtml(issue.body) }} />
          </div>
          <div className="bg-[#f9fafb] px-6 py-4 text-xs text-[#5b6676]">
            You receive this because you subscribed to the S.A. Mastatine newsletter. <u>Unsubscribe</u>.
            <br />
            {PARODY_NOTICE}
          </div>
        </div>
      </div>
    </div>
  );
}
