import { createClient } from "@supabase/supabase-js";

// Derive Supabase project URL from the DATABASE_URL env var.
// Supports both direct (db.<ref>.supabase.co) and pooler (postgres.<ref>@...pooler) formats.
function getSupabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const direct = dbUrl.match(/@db\.([^.]+)\.supabase\.co/);
  if (direct) return `https://${direct[1]}.supabase.co`;
  const pooler = dbUrl.match(/postgres\.([^:]+):/);
  if (pooler) return `https://${pooler[1]}.supabase.co`;
  throw new Error("Cannot derive Supabase URL from DATABASE_URL");
}

export function createStorageClient() {
  return createClient(getSupabaseUrl(), process.env.SUPABASE_ANON_KEY!);
}
