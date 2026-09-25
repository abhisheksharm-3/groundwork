/** Crawlers may read every page. Per-visitor pages (checkout, accounts) mark themselves noindex in their own layouts. */
import type { MetadataRoute } from "next";
import { ENV } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", ENV.NEXT_PUBLIC_SITE_URL).href,
  };
}
