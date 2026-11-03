import type { MetadataRoute } from "next";
import { getNews } from "@/lib/news";
import { siteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

const PAGES = ["/", "/about", "/board", "/committees", "/history", "/membership", "/news", "/mastapps", "/mastapps/activities", "/mastapps/quotes", "/newsletter", "/contact", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const news = await getNews();
  return [
    ...PAGES.map((path) => ({ url: `${base}${path === "/" ? "" : path}` })),
    ...news.map((post) => ({ url: `${base}/news/${post.slug}`, lastModified: post.date })),
  ];
}
