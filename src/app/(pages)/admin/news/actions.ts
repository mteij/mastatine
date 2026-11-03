"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import sql from "@/lib/db";
import { isValidAnnouncementLink } from "@/lib/announcement";
import { slugify } from "@/lib/news";
import { requireAdmin } from "@/lib/session";

const id = z.uuid();

const newsSchema = z.object({
  title: z.string().trim().min(1).max(150),
  summary: z.string().trim().max(300),
  body: z.string().trim().min(1).max(20000),
  published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function refresh() {
  // The bar, the homepage card and /news all read the news.
  revalidatePath("/", "layout");
}

/** A slug nobody else uses: "title", then "title-2", "title-3" and so on. */
async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  for (let n = 1; n < 100; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const [taken] = await sql`SELECT 1 FROM news_posts WHERE slug = ${candidate}`;
    if (!taken) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function createNews(formData: FormData) {
  const session = await requireAdmin();
  const data = newsSchema.parse(Object.fromEntries(formData));
  const slug = await uniqueSlug(data.title);
  await sql`
    INSERT INTO news_posts (slug, title, summary, body, published_at, created_by)
    VALUES (${slug}, ${data.title}, ${data.summary}, ${data.body}, ${data.published_at}, ${session.user.id})
  `;
  refresh();
  redirect("/admin/news?notice=published");
}

export async function saveNews(formData: FormData) {
  await requireAdmin();
  const postId = id.parse(formData.get("id"));
  const data = newsSchema.parse(Object.fromEntries(formData));
  // The slug stays as it was, so links to the post keep working after a title change.
  await sql`
    UPDATE news_posts SET title = ${data.title}, summary = ${data.summary}, body = ${data.body},
      published_at = ${data.published_at}, updated_at = NOW()
    WHERE id = ${postId}
  `;
  refresh();
  redirect("/admin/news?notice=saved");
}

export async function deleteNews(formData: FormData) {
  await requireAdmin();
  await sql`DELETE FROM news_posts WHERE id = ${id.parse(formData.get("id"))}`;
  refresh();
  redirect("/admin/news?notice=deleted");
}

const announcementSchema = z.object({
  mode: z.enum(["latest_news", "custom", "off"]),
  title: z.string().trim().max(120),
  summary: z.string().trim().max(200),
  link: z.string().trim().max(500),
});

export async function saveAnnouncement(formData: FormData) {
  await requireAdmin();
  const parsed = announcementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/news?notice=announcement-invalid");
  const data = parsed.data;
  if (data.mode === "custom" && (!data.title || !isValidAnnouncementLink(data.link))) redirect("/admin/news?notice=announcement-invalid");

  // Saving always bumps updated_at: the bar comes back for everyone who dismissed the previous message.
  await sql`
    INSERT INTO site_announcement (id, mode, title, summary, link, updated_at)
    VALUES (1, ${data.mode}, ${data.title}, ${data.summary}, ${data.link}, NOW())
    ON CONFLICT (id) DO UPDATE SET mode = EXCLUDED.mode, title = EXCLUDED.title, summary = EXCLUDED.summary, link = EXCLUDED.link, updated_at = NOW()
  `;
  refresh();
  redirect("/admin/news?notice=announcement-saved");
}
