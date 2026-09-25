/**
 * Supabase's project URL and publishable key, from Project Settings -> API. Both
 * are safe to expose, which is why they carry the NEXT_PUBLIC_ prefix; row level
 * security, not key secrecy, is what protects the data. The secret key is not,
 * and only admin.ts reads it.
 */
import { z } from "zod";
import { OPTIONAL_TEXT } from "@/lib/env-fields";

export const SUPABASE_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.url().optional(),
  ),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: OPTIONAL_TEXT,
  /** Server-only. Lets the payment webhook record sales, which it does with no signed-in user. */
  SUPABASE_SECRET_KEY: OPTIONAL_TEXT,
};
