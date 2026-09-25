/** Sign-in and sign-up. Per-visitor pages, so search engines leave them out. */
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: LayoutProps<"/">): ReactNode {
  return children;
}
