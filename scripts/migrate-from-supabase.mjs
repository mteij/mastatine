// One-off: copy towers + votes from Supabase into the self-hosted Postgres and
// download every tower image into UPLOAD_DIR as WebP, rewriting image_url to /uploads/<file>.webp.
//
//   SOURCE_DATABASE_URL=<supabase url> TARGET_DATABASE_URL=<local url> UPLOAD_DIR=./uploads \
//     node scripts/migrate-from-supabase.mjs
//
// Safe to re-run: rows are upserted by id and existing files are not re-downloaded.
import postgres from "postgres";
import { mkdir, writeFile, access } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

const { SOURCE_DATABASE_URL, TARGET_DATABASE_URL } = process.env;
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
if (!SOURCE_DATABASE_URL || !TARGET_DATABASE_URL) {
  console.error("Set SOURCE_DATABASE_URL and TARGET_DATABASE_URL");
  process.exit(1);
}

const source = postgres(SOURCE_DATABASE_URL, { ssl: "require", prepare: false, max: 1 });
const target = postgres(TARGET_DATABASE_URL, { max: 1 });

const exists = (p) => access(p).then(() => true, () => false);

async function localiseImage(url) {
  if (url.startsWith("/uploads/")) return url;
  const stem = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "").toLowerCase().replace(/\.[a-z0-9]+$/, "");
  const filename = `${/^[a-z0-9-]+$/.test(stem) ? stem : `${Date.now()}-${randomUUID()}`}.webp`;
  const dest = path.join(uploadDir, filename);
  if (!(await exists(dest))) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const webp = await sharp(new Uint8Array(await res.arrayBuffer()), { animated: true })
      .rotate()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toBuffer();
    await writeFile(dest, webp);
  }
  return `/uploads/${filename}`;
}

await mkdir(uploadDir, { recursive: true });

const towers = await source`SELECT * FROM towers ORDER BY created_at`;
let failed = 0;
for (const t of towers) {
  let imageUrl = t.image_url;
  try {
    imageUrl = await localiseImage(t.image_url);
  } catch (err) {
    failed++;
    console.warn(`  image kept as remote URL for "${t.title}" (${t.id}): ${err.message}`);
  }
  await target`
    INSERT INTO towers (id, title, description, submitter_name, image_url, height, vote_count, created_at)
    VALUES (${t.id}, ${t.title}, ${t.description}, ${t.submitter_name}, ${imageUrl},
            ${t.height === null || t.height === undefined ? null : Number(t.height)}, ${t.vote_count}, ${t.created_at})
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, submitter_name = EXCLUDED.submitter_name,
      image_url = EXCLUDED.image_url, height = EXCLUDED.height, vote_count = EXCLUDED.vote_count`;
}

const votes = await source`SELECT * FROM votes ORDER BY created_at`;
for (const v of votes) {
  await target`
    INSERT INTO votes (id, tower_id, voter_id, direction, created_at)
    VALUES (${v.id}, ${v.tower_id}, ${v.voter_id}, ${v.direction ?? "up"}, ${v.created_at})
    ON CONFLICT (id) DO NOTHING`;
}

console.log(`Migrated ${towers.length} towers (${failed} images left remote) and ${votes.length} votes.`);
await source.end();
await target.end();
