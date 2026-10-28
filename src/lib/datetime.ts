/** The association lives in one time zone; the server may not, so every date is read and shown in it explicitly. */
export const TIME_ZONE = "Europe/Amsterdam";

const partsFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function zonedParts(date: Date): Record<string, string> {
  return Object.fromEntries(partsFormat.formatToParts(date).map((p) => [p.type, p.value]));
}

/** Value for <input type="datetime-local"> showing `date` in the association's time zone. */
export function toLocalInput(date: Date | null | undefined): string {
  if (!date) return "";
  const p = zonedParts(date);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

const LOCAL_INPUT_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** Parses a datetime-local value as wall-clock time in the association's time zone. Returns null when invalid. */
export function fromLocalInput(value: string): Date | null {
  const m = LOCAL_INPUT_RE.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const wanted = Date.UTC(y, mo - 1, d, h, mi);
  // The zone's offset depends on the instant; two passes settle it across daylight-saving changes.
  let guess = wanted;
  for (let i = 0; i < 2; i++) {
    const p = zonedParts(new Date(guess));
    const shown = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute));
    guess += wanted - shown;
  }
  const result = new Date(guess);
  return Number.isNaN(result.getTime()) ? null : result;
}

const numeric = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const dayMonth = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric", month: "long" });
const timeOnly = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** 28-10-2026 20:00 */
export function formatDateTime(date: Date): string {
  return numeric.format(date).replace(/\//g, "-").replace(",", "");
}

const dayNumber = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric" });
const monthShort = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, month: "short" });

export const formatDayNumber = (date: Date): string => dayNumber.format(date);
export const formatMonthShort = (date: Date): string => monthShort.format(date);
export const formatDayMonth =(date: Date): string => dayMonth.format(date);
export const formatTime = (date: Date): string => timeOnly.format(date);

/** YYYY-MM-DD of an instant in the association's time zone. */
export function zonedDay(date: Date): string {
  const p = zonedParts(date);
  return `${p.year}-${p.month}-${p.day}`;
}
