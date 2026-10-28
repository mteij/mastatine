/** Timing for live minuting. No imports, so client components can use it. */

/** A lock that is not renewed within this time is treated as released (closed tab, lost connection). */
export const LOCK_SECONDS = 20;
/** How often an editor renews its lock. */
export const HEARTBEAT_MS = 8000;
/** How often editors and the live view poll for changes. */
export const POLL_MS = 3000;
/** Pause after the last keystroke before autosaving. */
export const AUTOSAVE_MS = 1200;

/** "1." for top-level items, "a." for sub-items, numbered within their parent. */
export function itemLabels(items: { level: number }[]): string[] {
  let major = 0;
  let minor = 0;
  return items.map((item) => {
    if (item.level === 0) {
      major += 1;
      minor = 0;
      return `${major}.`;
    }
    minor += 1;
    return `${String.fromCharCode(96 + minor)}.`;
  });
}
