import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sql from "@/lib/db";
import { UPLOAD_DIR, UPLOAD_FILENAME_RE } from "@/lib/uploads";

/** Newsletter sign-ups that were never confirmed are dropped after this many days. */
export const UNCONFIRMED_SUBSCRIBER_DAYS = 7;

export interface PurgeResult {
  sessions: number;
  verifications: number;
  unconfirmedSubscribers: number;
  orphanUploads: number;
}

/** Uploads younger than this may still be waiting for their form to be submitted. */
const ORPHAN_UPLOAD_MIN_AGE_MS = 24 * 60 * 60 * 1000;

/** Deletes files in the upload directory that no mast or activity references (abandoned or abusive uploads). */
async function purgeOrphanUploads(): Promise<number> {
  const files = await readdir(UPLOAD_DIR).catch(() => [] as string[]);
  const candidates = files.filter((f) => UPLOAD_FILENAME_RE.test(f));
  if (candidates.length === 0) return 0;

  // Pictures in minutes are referenced from inside the notes text (Markdown), so they are pulled out of it.
  const rows = await sql<{ url: string }[]>`
    SELECT image_url AS url FROM towers
    UNION SELECT poster_url FROM activities WHERE poster_url IS NOT NULL
    UNION SELECT found[1] FROM meeting_items, regexp_matches(notes, '(/uploads/[a-z0-9-]+\\.(?:jpg|png|webp|gif))', 'g') AS found
  `;
  const used = new Set(rows.map((r) => r.url));

  let removed = 0;
  for (const file of candidates) {
    if (used.has(`/uploads/${file}`)) continue;
    const full = path.join(UPLOAD_DIR, file);
    const info = await stat(full).catch(() => null);
    if (!info || Date.now() - info.mtimeMs < ORPHAN_UPLOAD_MIN_AGE_MS) continue;
    if (await unlink(full).then(() => true, () => false)) removed++;
  }
  return removed;
}

/**
 * Data minimisation: removes records that have no remaining purpose.
 * Expired sessions hold an IP address and browser type; expired verification rows hold an email address.
 */
export async function purgeExpiredData(): Promise<PurgeResult> {
  const sessions = await sql`DELETE FROM session WHERE "expiresAt" < NOW() RETURNING id`;
  const verifications = await sql`DELETE FROM verification WHERE "expiresAt" < NOW() RETURNING id`;
  const unconfirmedSubscribers = await sql`
    DELETE FROM newsletter_subscribers
    WHERE status = 'pending' AND created_at < NOW() - make_interval(days => ${UNCONFIRMED_SUBSCRIBER_DAYS})
    RETURNING id
  `;
  await sql`DELETE FROM signup_preferences WHERE created_at < NOW() - INTERVAL '1 day'`;
  const orphanUploads = await purgeOrphanUploads();
  return {
    orphanUploads,
    sessions: sessions.length,
    verifications: verifications.length,
    unconfirmedSubscribers: unconfirmedSubscribers.length,
  };
}
