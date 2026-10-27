import { siteUrl } from "@/lib/env";

/**
 * Client IP as set by the reverse proxy. The proxy must overwrite X-Forwarded-For (not append to it);
 * otherwise a client could pick its own address and dodge rate limits.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * CSRF defence for cookie-less JSON endpoints. Browsers always send Origin on cross-site POSTs, so a
 * request is accepted only when its Origin is this site: the configured SITE_URL, or the host the request
 * was actually addressed to (which keeps localhost / LAN access working in development).
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }
  if (originUrl.origin === new URL(siteUrl()).origin) return true;

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  return host !== null && originUrl.host === host;
}
