import { createRateLimiter } from "@/lib/rate-limit";

// Per-address cap so one inbox cannot be flooded from many IPs.
const limiter = createRateLimiter(3, 15 * 60 * 1000);

export function allowMagicLinkFor(email: string): boolean {
  return limiter.allow(email.trim().toLowerCase());
}
