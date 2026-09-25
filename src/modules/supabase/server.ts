/**
 * The Supabase client for Server Components, Server Actions and Route Handlers,
 * reading and writing the session cookies through Next's cookie store. Null when
 * the project has no Supabase keys, so every caller can say so instead of failing.
 */
import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { ENV } from "@/lib/env";

/**
 * Next forbids setting cookies while a Server Component renders. Supabase tries
 * to during a token refresh; the proxy has already refreshed the session for
 * that request, so this one error is safe to drop. Anything else is rethrown.
 */
const READ_ONLY_COOKIES = /Server Action or Route Handler/;

export async function createSupabase(): Promise<SupabaseClient | null> {
  const {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
  } = ENV;
  if (!url || !key) return null;
  const store = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet)
            store.set(name, value, options);
        } catch (error) {
          if (
            !(error instanceof Error && READ_ONLY_COOKIES.test(error.message))
          )
            throw error;
        }
      },
    },
  });
}
