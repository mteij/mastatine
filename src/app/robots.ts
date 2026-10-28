import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/login", "/api/", "/newsletter/confirm", "/newsletter/unsubscribe"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
