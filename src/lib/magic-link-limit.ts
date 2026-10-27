const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 3;

const attempts = new Map<string, number[]>();

/** Per-address cap so one inbox cannot be flooded from many IPs. In-memory: fine for a single instance. */
export function allowMagicLinkFor(email: string, now = Date.now()): boolean {
  const key = email.trim().toLowerCase();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    attempts.set(key, recent);
    return false;
  }
  attempts.set(key, [...recent, now]);

  if (attempts.size > 5000) {
    for (const [k, times] of attempts) {
      if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(k);
    }
  }
  return true;
}
