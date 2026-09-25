/**
 * Refreshes the Supabase session on each request the proxy matches, and turns a
 * signed-out request for the dashboard into a real redirect. Follows Supabase's
 * own pattern: nothing runs between creating the client and `getClaims`, and the
 * response `setAll` last built is the one returned, because an earlier response
 * does not carry the refreshed cookies and the user would be signed out.
 */
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function refreshSession(
  request: NextRequest,
): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return signedOut(request) ?? response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet)
          request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet)
          response.cookies.set(name, value, options);
        for (const [name, value] of Object.entries(headers))
          response.headers.set(name, value);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  if (data?.claims) return response;
  return signedOut(request) ?? response;
}

/** A signed-out request for the dashboard goes to sign-in, remembering where it was headed. */
function signedOut(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) return null;
  const target = request.nextUrl.clone();
  target.pathname = "/sign-in";
  target.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(target);
}
