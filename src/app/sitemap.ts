import type { MetadataRoute } from "next";
import { NEWS } from "@/content/site";
import { siteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

const PAGES = ["/", "/about", "/board", "/committees", "/history", "/membership", "/news", "/mastapps", "/mastapps/quotes", "/newsletter", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    ...PAGES.map((path) => ({ url: `${base}${path === "/" ? "" : path}` })),
    ...NEWS.map((post) => ({ url: `${base}/news/${post.slug}`, lastModified: post.date })),
  ];
}
