import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var _sql: ReturnType<typeof postgres> | undefined;
}

const sql =
  global._sql ??
  postgres(process.env.DATABASE_URL!, {
    ssl: "require",
    max: 2,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // required for Supabase transaction-mode pooler (port 6543)
  });

if (process.env.NODE_ENV !== "production") {
  global._sql = sql;
}

export default sql;
