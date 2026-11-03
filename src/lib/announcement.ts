import sql from "@/lib/db";
import { getLatestNews } from "@/lib/news";

export type AnnouncementMode = "latest_news" | "custom" | "off";

export interface AnnouncementSettings {
  mode: AnnouncementMode;
  title: string;
  summary: string;
  /** An internal path ("/news") or an http(s) address; empty for no link. */
  link: string;
}

/** What the bar renders. `id` changes whenever the message does, which is what brings back a dismissed bar. */
export interface Announcement {
  id: string;
  title: string;
  summary: string;
  href: string | null;
}

const DEFAULTS: AnnouncementSettings = { mode: "latest_news", title: "", summary: "", link: "" };

export async function getAnnouncementSettings(): Promise<AnnouncementSettings & { version: string }> {
  try {
    const [row] = await sql<(AnnouncementSettings & { version: string })[]>`
      SELECT mode, title, summary, link, to_char(updated_at, 'YYYYMMDDHH24MISSUS') AS version FROM site_announcement WHERE id = 1
    `;
    return row ?? { ...DEFAULTS, version: "0" };
  } catch (error) {
    console.error("Failed to load the announcement:", (error as Error).message);
    return { ...DEFAULTS, version: "0" };
  }
}

/** Only same-site paths and http(s) addresses may be linked; anything else would be an unsafe href. */
export function isValidAnnouncementLink(link: string): boolean {
  if (link === "") return true;
  if (link.startsWith("/")) return !link.startsWith("//") && !link.includes("\\");
  return /^https?:\/\/[^\s]+$/i.test(link);
}

export async function getAnnouncement(): Promise<Announcement | null> {
  const settings = await getAnnouncementSettings();
  if (settings.mode === "off") return null;
  if (settings.mode === "custom") {
    if (!settings.title) return null;
    return { id: `custom-${settings.version}`, title: settings.title, summary: settings.summary, href: settings.link || null };
  }
  const latest = await getLatestNews();
  return latest ? { id: latest.slug, title: latest.title, summary: latest.summary, href: `/news/${latest.slug}` } : null;
}
