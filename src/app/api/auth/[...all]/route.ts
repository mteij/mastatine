import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";
import { clientIp } from "@/lib/request";

/** Better Auth reads the first X-Forwarded-For entry, which a client can choose. Hand it the address we trust instead. */
function withTrustedIp(req: Request): Request {
  const headers = new Headers(req.headers);
  headers.set("x-forwarded-for", clientIp(req));
  // Not `new Request(req, ...)`: Next's request object is not a plain Request and the copy constructor throws on it.
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  return new Request(req.url, {
    method: req.method,
    headers,
    body: hasBody ? req.body : null,
    ...(hasBody && { duplex: "half" }),
  } as RequestInit);
}

export function GET(req: Request) {
  return toNextJsHandler(getAuth()).GET(withTrustedIp(req));
}

export function POST(req: Request) {
  return toNextJsHandler(getAuth()).POST(withTrustedIp(req));
}
