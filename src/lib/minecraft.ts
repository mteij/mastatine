import { z } from "zod";

export const MINECRAFT_HOST = process.env.MINECRAFT_HOST?.trim() || "aaa.mastatine.nl";
export const MINECRAFT_MAP_URL = process.env.MINECRAFT_MAP_URL?.trim() || "https://map.mastatine.nl";

export interface MinecraftStatus {
  online: boolean;
  players: number;
  max: number;
}

const CACHE_MS = 60_000;
const FAILURE_CACHE_MS = 20_000;
const TIMEOUT_MS = 3_000;

const responseSchema = z.object({
  online: z.boolean(),
  players: z.object({ online: z.number().int().min(0), max: z.number().int().min(0) }).optional(),
});

let cached: { at: number; ttl: number; value: MinecraftStatus | null } | undefined;

/**
 * Live player count from the public mcsrvstat.us status API, queried from the server only (visitors never contact it,
 * and the CSP stays `connect-src 'self'`). The host is fixed configuration, never user input. Cached in memory so the
 * homepage cannot be used to hammer the API; returns null when the status is unknown.
 */
export async function getMinecraftStatus(now = Date.now()): Promise<MinecraftStatus | null> {
  if (cached && now - cached.at < cached.ttl) return cached.value;

  let value: MinecraftStatus | null = null;
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(MINECRAFT_HOST)}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "mastatine.nl status check" },
      cache: "no-store",
    });
    if (res.ok) {
      const parsed = responseSchema.safeParse(await res.json());
      if (parsed.success) {
        value = { online: parsed.data.online, players: parsed.data.players?.online ?? 0, max: parsed.data.players?.max ?? 0 };
      }
    }
  } catch (error) {
    console.error("Minecraft status check failed:", (error as Error).message);
  }

  cached = { at: now, ttl: value ? CACHE_MS : FAILURE_CACHE_MS, value };
  return value;
}
