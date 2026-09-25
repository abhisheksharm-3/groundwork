/** The checkout pages. They are per-buyer, so no search engine should index them. */
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function CheckoutLayout({
  children,
}: LayoutProps<"/">): ReactNode {
  return children;
}
