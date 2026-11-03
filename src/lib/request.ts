import { siteUrl } from "@/lib/env";

/**
 * Client IP from X-Forwarded-For. Each trusted proxy appends the address it received the request from, so only
 * the entries it added can be believed: the client's own (spoofable) entries sit to the left. We therefore count
 * from the right, skipping TRUSTED_PROXY_HOPS - 1 further proxies (default 1: a single reverse proxy in front of the app).
 * This stays correct whether the proxy overwrites or appends to the header.
 */
export function clientIp(req: Request): string {
  const entries = (req.headers.get("x-forwarded-for") ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS) || 1);
  return entries[Math.max(0, entries.length - hops)] ?? "unknown";
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
