/**
 * Runs before the account pages only: refreshes the Supabase session and sends a
 * signed-out visitor from the dashboard to sign-in. The marketing pages never pass
 * through here, so they stay static and pay nothing for auth.
 */
import type { NextRequest, NextResponse } from "next/server";
import { refreshSession } from "@/modules/supabase/proxy-session";

export function proxy(request: NextRequest): Promise<NextResponse> {
  return refreshSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
