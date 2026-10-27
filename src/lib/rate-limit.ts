/**
 * Small in-memory sliding-window limiter. State lives in the Node process, which is correct for a
 * single-instance deployment; use a shared store if the app is ever scaled horizontally.
 */
export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  return {
    /** Records an attempt and returns whether it is allowed. */
    allow(key: string, now = Date.now()): boolean {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= max) {
        hits.set(key, recent);
        return false;
      }
      hits.set(key, [...recent, now]);

      if (hits.size > 5000) {
        for (const [k, times] of hits) {
          if (times.every((t) => now - t >= windowMs)) hits.delete(k);
        }
      }
      return true;
    },
  };
}
