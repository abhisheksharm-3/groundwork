/** Who is signed in, from a verified token. `getClaims` checks the JWT's signature; the cookie alone is never trusted. */
import "server-only";
import { ProfileSchema } from "./schemas";
import { createSupabase } from "./server";
import type { SessionUserType } from "./types";

export async function currentUser(): Promise<SessionUserType | null> {
  const supabase = await createSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub || typeof claims.email !== "string") return null;

  const { data: row } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", claims.sub)
    .maybeSingle();
  const profile = ProfileSchema.safeParse(row);
  return {
    id: claims.sub,
    email: claims.email,
    displayName:
      (profile.success && profile.data.display_name) ||
      claims.email.split("@")[0] ||
      "there",
  };
}
