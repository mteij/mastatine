import sql from "@/lib/db";

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  summary: string;
  /** Plain text; a blank line starts a new paragraph. */
  body: string;
}

// A function, not a constant: building the fragment at import time would throw during `next build`, which has no database.
const columns = () => sql`id, slug, title, summary, body, to_char(published_at, 'YYYY-MM-DD') AS date`;

/** Newest first. Failing to reach the database must not take a whole page down, so reads return an empty list. */
export async function getNews(limit = 100): Promise<NewsPost[]> {
  try {
    return await sql<NewsPost[]>`SELECT ${columns()} FROM news_posts ORDER BY published_at DESC, created_at DESC LIMIT ${limit}`;
  } catch (error) {
    console.error("Failed to load the news:", (error as Error).message);
    return [];
  }
}

export async function getLatestNews(): Promise<NewsPost | null> {
  return (await getNews(1))[0] ?? null;
}

export async function findNews(slug: string): Promise<NewsPost | null> {
  const [post] = await sql<NewsPost[]>`SELECT ${columns()} FROM news_posts WHERE slug = ${slug}`;
  return post ?? null;
}

export function newsParagraphs(body: string): string[] {
  return body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** A URL-friendly slug from a title ("We are back!" becomes "we-are-back"). */
export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "") || "news";
}
