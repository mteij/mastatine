import { createClient } from "@supabase/supabase-js";

// Derive Supabase project URL from the DATABASE_URL env var.
// e.g. db.xrocqaftybinkmbvjkht.supabase.co → https://xrocqaftybinkmbvjkht.supabase.co
function getSupabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const match = dbUrl.match(/@db\.([^.]+)\.supabase\.co/);
  if (match) return `https://${match[1]}.supabase.co`;
  throw new Error("Cannot derive Supabase URL from DATABASE_URL");
}

export function createStorageClient() {
  return createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
