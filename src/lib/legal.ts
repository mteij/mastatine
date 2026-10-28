export interface LegalIdentity {
  name: string | null;
  address: string | null;
  kvk: string | null;
  email: string | null;
}

/** Who runs the site, read at request time from LEGAL_NAME, LEGAL_ADDRESS, KVK_NUMBER and CONTACT_EMAIL. */
export function getLegalIdentity(): LegalIdentity {
  const env = process.env as Record<string, string | undefined>; // aliased so the bundler does not inline it at build time
  const read = (key: string) => env[key]?.trim() || null;
  return { name: read("LEGAL_NAME"), address: read("LEGAL_ADDRESS"), kvk: read("KVK_NUMBER"), email: read("CONTACT_EMAIL") };
}
