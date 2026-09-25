/** The root shell: metadata, the skip link, the header and footer. */
import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ENV } from "@/lib/env";
import { SITE } from "@/lib/site-config";
import { FONT_VARIABLES } from "@/styles/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(ENV.NEXT_PUBLIC_SITE_URL),
  title: {
    default: `${SITE.name} ${SITE.edition} · ${SITE.dates.label}, ${SITE.venue.city}`,
    template: `%s · ${SITE.name} ${SITE.edition}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale.replace("-", "_"),
    siteName: `${SITE.name} ${SITE.edition}`,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
};

export default function RootLayout({ children }: LayoutProps<"/">): ReactNode {
  return (
    <html lang={SITE.locale} className={FONT_VARIABLES}>
      <body>
        <a
          href="#main"
          className="label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-action focus:px-5 focus:py-3 focus:text-action-ink"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
