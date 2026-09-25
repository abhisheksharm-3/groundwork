/**
 * The signed-in area. The proxy already redirects a signed-out request; this
 * checks again, because a proxy matcher is one refactor away from missing a path.
 * The user is provided to client components by rendering the Context directly.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { SessionContext } from "@/modules/supabase/components/SessionContext";
import { currentUser } from "@/modules/supabase/session";
import type { ChildrenPropsType } from "@/types/ui";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DashboardLayout({
  children,
}: LayoutProps<"/">): ReactNode {
  return (
    <Suspense fallback={<div className="on-brand min-h-[60svh]" />}>
      <SessionGate>{children}</SessionGate>
    </Suspense>
  );
}

async function SessionGate({
  children,
}: ChildrenPropsType): Promise<ReactNode> {
  const user = await currentUser();
  if (!user) redirect("/sign-in?next=/dashboard");
  return <SessionContext value={user}>{children}</SessionContext>;
}
