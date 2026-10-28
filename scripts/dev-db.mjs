// Docker-free local database for development: a real Postgres (PGlite, WebAssembly) served on 127.0.0.1:5432.
// Data persists in ./.pglite between runs. Keep this running in its own terminal while you use `bun run dev`.
// The same migrations as production are applied on start.
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { spawnSync } from "node:child_process";

const PORT = Number(process.env.DEV_DB_PORT ?? 5432);
const db = await PGlite.create("./.pglite");
const server = new PGLiteSocketServer({ db, port: PORT, host: "127.0.0.1", maxConnections: 20 });
await server.start();

const url = `postgresql://mastatine:dev@127.0.0.1:${PORT}/mastatine`;
const migrate = spawnSync(process.execPath, ["scripts/migrate.mjs"], { env: { ...process.env, DATABASE_URL: url }, stdio: "inherit" });
if (migrate.status !== 0) {
  console.error("Migrations failed; stopping.");
  await server.stop();
  process.exit(1);
}

console.log(`\nDev database ready on ${url}\nPress Ctrl+C to stop. Data is kept in ./.pglite`);

async function shutdown() {
  await server.stop();
  await db.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
