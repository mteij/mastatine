// Applies db/migrations/*.sql in filename order, once each, inside a transaction.
// Safe to run on every container start; an advisory lock serialises concurrent runs.
import postgres from "postgres";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../db/migrations");
const sql = postgres(url, { max: 1, onnotice: () => {} });

try {
  await sql`SELECT pg_advisory_lock(727274)`;
  await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  const applied = new Set((await sql`SELECT name FROM schema_migrations`).map((r) => r.name));

  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const body = await readFile(path.join(dir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`INSERT INTO schema_migrations (name) VALUES (${file})`;
    });
    console.log(`migrated ${file}`);
  }
  console.log("database is up to date");
} catch (error) {
  console.error("migration failed:", error);
  process.exitCode = 1;
} finally {
  await sql`SELECT pg_advisory_unlock(727274)`.catch(() => {});
  await sql.end();
}
