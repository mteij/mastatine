const DAY_MS = 24 * 60 * 60 * 1000;
const FIRST_RUN_DELAY_MS = 60 * 1000;

/** Runs once when the server starts: schedules the daily data-minimisation purge (single-instance deployment). */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) return;

  const { purgeExpiredData } = await import("@/lib/purge");
  const run = async () => {
    try {
      const result = await purgeExpiredData();
      console.info("[purge] removed", result);
    } catch (error) {
      console.error("[purge] failed", error);
    }
  };

  setTimeout(run, FIRST_RUN_DELAY_MS).unref();
  setInterval(run, DAY_MS).unref();
}
