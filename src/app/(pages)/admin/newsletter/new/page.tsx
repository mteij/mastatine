import Link from "next/link";
import { createIssue } from "../../actions";

export default function NewIssuePage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/newsletter" className="text-sm font-medium text-accent-text hover:underline">&larr; Newsletter</Link>
      <h2 className="mt-3 text-2xl font-bold">New issue</h2>
      <form action={createIssue} className="card mt-6 space-y-5 p-6">
        <div>
          <label className="label" htmlFor="subject">Subject</label>
          <input id="subject" name="subject" className="input" required maxLength={150} />
        </div>
        <div>
          <label className="label" htmlFor="body">Message</label>
          <textarea id="body" name="body" className="input min-h-72 font-mono" required maxLength={20000} />
          <p className="hint">Plain text. Blank lines start a new paragraph and web addresses become links. The unsubscribe link and the parody notice are added automatically.</p>
        </div>
        <button type="submit" className="btn btn-primary">Save as draft</button>
      </form>
    </div>
  );
}
