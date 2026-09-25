/** Every page in the main nav, at the configured origin. Module pages opt out: checkout and accounts are not search results. */
import type { MetadataRoute } from "next";
import { ENV } from "@/lib/env";
import { SITE } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE.nav.map((item) => ({
    url: new URL(item.href, ENV.NEXT_PUBLIC_SITE_URL).href,
    changeFrequency: "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));
}
