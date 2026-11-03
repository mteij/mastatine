import Link from "next/link";
import { getAnnouncementSettings } from "@/lib/announcement";
import { formatDate, getNews } from "@/lib/news";
import { requireAdmin } from "@/lib/session";
import { saveAnnouncement } from "./actions";

const NOTICES: Record<string, { text: string; tone: "ok" | "bad" }> = {
  published: { text: "Post published.", tone: "ok" },
  saved: { text: "Post saved.", tone: "ok" },
  deleted: { text: "Post deleted.", tone: "ok" },
  "announcement-saved": { text: "Announcement bar saved.", tone: "ok" },
  "announcement-invalid": { text: "The announcement was not saved. A custom message needs a title, and a link must start with / or https://.", tone: "bad" },
};

const MODES = [
  { value: "latest_news", label: "Latest news post" },
  { value: "custom", label: "Custom message" },
  { value: "off", label: "Off" },
] as const;

export default async function AdminNews(props: { searchParams: Promise<{ notice?: string }> }) {
  // Layouts do not re-run on client navigation, so each admin page checks the role itself.
  await requireAdmin();
  const { notice } = await props.searchParams;
  const [posts, announcement] = await Promise.all([getNews(200), getAnnouncementSettings()]);
  const message = notice ? NOTICES[notice] : undefined;

  return (
    <div className="space-y-8">
      {message && (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm ${message.tone === "ok" ? "bg-accent-soft text-accent-text" : "bg-danger/10 text-danger"}`}>
          {message.text}
        </p>
      )}

      <section aria-labelledby="bar-title">
        <h2 id="bar-title" className="text-base font-extrabold">Announcement bar</h2>
        <form action={saveAnnouncement} className="card mt-3 max-w-2xl space-y-4 p-4">
          <fieldset className="space-y-1">
            <legend className="label">What it shows</legend>
            {MODES.map((mode) => (
              <label key={mode.value} className="choice-row">
                <input type="radio" name="mode" value={mode.value} defaultChecked={announcement.mode === mode.value} className="mt-0" />
                <span className="font-bold">{mode.label}</span>
              </label>
            ))}
          </fieldset>
          <div>
            <label className="label" htmlFor="ann-title">Custom message</label>
            <input id="ann-title" name="title" className="input" maxLength={120} defaultValue={announcement.title} placeholder="Borrel this Friday!" />
          </div>
          <div>
            <label className="label" htmlFor="ann-summary">Extra line (optional)</label>
            <input id="ann-summary" name="summary" className="input" maxLength={200} defaultValue={announcement.summary} />
          </div>
          <div>
            <label className="label" htmlFor="ann-link">Link (optional)</label>
            <input id="ann-link" name="link" className="input" maxLength={500} defaultValue={announcement.link} placeholder="/mastapps/activities or https://…" />
          </div>
          <button type="submit" className="btn btn-primary">Save announcement bar</button>
        </form>
      </section>

      <section aria-labelledby="posts-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="posts-title" className="text-base font-extrabold">News posts</h2>
          <Link href="/admin/news/new" className="btn btn-primary">New post</Link>
        </div>
        <div className="table-wrap">
          <table className="table table-stack">
            <thead><tr><th>Title</th><th>Date</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td data-primary>
                    <Link href={`/news/${post.slug}`} className="font-medium hover:text-accent-text">{post.title}</Link>
                  </td>
                  <td data-label="Date" className="whitespace-nowrap text-muted">{formatDate(post.date)}</td>
                  <td className="text-right">
                    <Link href={`/admin/news/${post.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && <tr><td colSpan={3} className="py-10 text-center text-muted">No news yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
