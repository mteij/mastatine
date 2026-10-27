/** Reads a required environment variable at call time (never at build time). */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

/** Public origin of the site, without a trailing slash. */
export function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export const SITE_NAME = "S.A. Mastatine";
