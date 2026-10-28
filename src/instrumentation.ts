const DAY_MS = 24 * 60 * 60 * 1000;
const FIRST_RUN_DELAY_MS = 60 * 1000;
const REMINDER_INTERVAL_MS = 15 * 60 * 1000;

/** Logs (never throws) when a production deployment is configured in a way that weakens security. */
function warnAboutUnsafeProductionConfig() {
  if (process.env.NODE_ENV !== "production") return;
  const problems: string[] = [];
  if (!/^https:\/\//i.test(process.env.SITE_URL ?? "")) problems.push("SITE_URL should be the public https origin (secure cookies, magic links)");
  if ((process.env.BETTER_AUTH_SECRET ?? "").length < 32) problems.push("BETTER_AUTH_SECRET should be at least 32 characters (openssl rand -base64 32)");
  if (!process.env.CONTACT_EMAIL) problems.push("CONTACT_EMAIL is not set (contact page and email footers need it)");
  if (process.env.MAIL_TRANSPORT === "log") problems.push("MAIL_TRANSPORT=log prints sign-in links to the logs; remove it in production");
  for (const problem of problems) console.warn(`[config] ${problem}`);
}

/** Runs once when the server starts: schedules the daily data-minimisation purge and the activity reminders (single-instance deployment). */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) return;

  warnAboutUnsafeProductionConfig();

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

  // "Tomorrow" reminders for activities. Safe to repeat or overlap: each subscription is claimed before its email is sent.
  const { sendDueReminders } = await import("@/lib/activity-emails");
  const remind = async () => {
    try {
      const result = await sendDueReminders();
      if (result.sent > 0 || result.failed > 0) console.info("[reminders]", result);
    } catch (error) {
      console.error("[reminders] failed", error);
    }
  };
  setTimeout(remind, FIRST_RUN_DELAY_MS).unref();
  setInterval(remind, REMINDER_INTERVAL_MS).unref();
}
