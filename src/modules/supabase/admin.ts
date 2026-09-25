/**
 * The one Supabase client that bypasses row level security, for writes made
 * with no signed-in user: the payment webhook recording a sale. The secret key
 * is read here and nowhere else, and only orders.ts imports this file.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "@/lib/env";

/** Null when the project URL or the secret key is unset. */
export function createAdminSupabase(): SupabaseClient | null {
  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SECRET_KEY: key } = ENV;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
