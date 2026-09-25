/** Every page in the main nav and every policy, at the configured origin. Checkout and accounts are not search results. */
import type { MetadataRoute } from "next";
import { ENV } from "@/lib/env";
import { SITE } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...SITE.nav, ...SITE.legal].map((item) => ({
    url: new URL(item.href, ENV.NEXT_PUBLIC_SITE_URL).href,
    changeFrequency: "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));
}
