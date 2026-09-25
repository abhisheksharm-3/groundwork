/**
 * Where Supabase sends the browser after Google sign-in or an email confirmation
 * link, carrying a one-time code. Exchanging it sets the session cookies, then
 * the visitor goes on to a same-site path only, never to an address from the URL.
 */
import { NextResponse } from "next/server";
import { reportProblem } from "@/lib/report-problem";
import { NextPathSchema } from "@/modules/supabase/schemas";
import { createSupabase } from "@/modules/supabase/server";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = NextPathSchema.parse(url.searchParams.get("next"));
  const supabase = await createSupabase();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    reportProblem("[supabase] code exchange failed:", error.message);
  }
  return NextResponse.redirect(new URL("/sign-in?error=callback", url.origin));
}
