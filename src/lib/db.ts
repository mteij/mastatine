import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

declare global {
  var _sql: Sql | undefined;
}

function createClient(): Sql {
  const url = process.env.DATABASE_URL;
  if (url) return postgres(url, { max: 10, idle_timeout: 20, connect_timeout: 10 });

  // Fail with an actionable message at query time (not import time, so `next build` still works).
  const fail = (): never => {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and run `bun run db:dev`.");
  };
  return new Proxy(function () {}, { apply: fail, get: fail }) as unknown as Sql;
}

const sql = global._sql ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global._sql = sql;
}

export default sql;

/** One readable line for a failed query; connection failures arrive as an empty AggregateError. */
export function describeDbError(error: unknown): string {
  const inner = error instanceof AggregateError ? error.errors[0] : error;
  if (inner && typeof inner === "object" && "code" in inner && inner.code === "ECONNREFUSED") {
    const { address, port } = inner as { address?: string; port?: number };
    return `database unreachable at ${address}:${port} (is it running? try \`bun run db:dev\`)`;
  }
  return inner instanceof Error ? inner.message : String(inner);
}
