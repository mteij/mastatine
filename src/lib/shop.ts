/** External merch shop (inlined at build time). Null when not configured, so no dead link is shown. */
export const SHOP_URL: string | null = process.env.NEXT_PUBLIC_SHOP_URL?.trim() || null;
