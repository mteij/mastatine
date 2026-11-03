import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { createNews } from "../actions";
import NewsForm from "../NewsForm";

export default async function NewNewsPage() {
  // Layouts do not re-run on client navigation, so each admin page checks the role itself.
  await requireAdmin();
  return (
    <div className="max-w-2xl">
      <Link href="/admin/news" className="text-sm font-medium text-accent-text hover:underline">&larr; News</Link>
      <h2 className="mt-3 text-2xl font-bold">New post</h2>
      <NewsForm action={createNews} submitLabel="Publish" />
    </div>
  );
}
