import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import ConfirmButton from "@/components/admin/ConfirmButton";
import sql from "@/lib/db";
import type { NewsPost } from "@/lib/news";
import { requireAdmin } from "@/lib/session";
import { deleteNews, saveNews } from "../actions";
import NewsForm from "../NewsForm";

export default async function EditNewsPage(props: { params: Promise<{ id: string }> }) {
  // Layouts do not re-run on client navigation, so each admin page checks the role itself.
  await requireAdmin();
  const { id } = await props.params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [post] = await sql<NewsPost[]>`
    SELECT id, slug, title, summary, body, to_char(published_at, 'YYYY-MM-DD') AS date FROM news_posts WHERE id = ${id}
  `;
  if (!post) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/news" className="text-sm font-medium text-accent-text hover:underline">&larr; News</Link>
      <h2 className="mt-3 text-2xl font-bold">Edit post</h2>
      <NewsForm action={saveNews} post={post} submitLabel="Save changes" />
      <form action={deleteNews} className="mt-4">
        <input type="hidden" name="id" value={post.id} />
        <ConfirmButton message={`Delete “${post.title}”? This cannot be undone.`} className="btn btn-danger btn-sm">Delete post</ConfirmButton>
      </form>
    </div>
  );
}
