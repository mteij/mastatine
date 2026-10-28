/**
 * External merch shop, read at request time so it can be changed in Docker without a rebuild.
 * Set SHOP_URL (NEXT_PUBLIC_SHOP_URL is still accepted). Returns null when unset or not an http(s) URL,
 * so no dead or unsafe link is ever rendered.
 */
export function getShopUrl(): string | null {
  const env = process.env as Record<string, string | undefined>; // aliased so the bundler does not inline it at build time
  const value = (env.SHOP_URL || env.NEXT_PUBLIC_SHOP_URL || "").trim();
  return /^https?:\/\//i.test(value) ? value : null;
}
