/** The closing band: where and when, how to reach the organisers, and the nav again. */
import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site-config";

export function SiteFooter(): ReactNode {
  return (
    <footer className="bg-brand-deepest text-on-brand">
      <div className="selvedge text-action" />
      <div className="page grid gap-12 py-section md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="font-display text-3xl">{SITE.name}</p>
          <p className="mt-4 max-w-(--container-prose) text-on-brand-soft">
            {SITE.tagline}
          </p>
        </div>

        <dl className="grid gap-6 md:col-span-3">
          <div>
            <dt className="label text-on-brand-soft">When</dt>
            <dd className="mt-2">{SITE.dates.label}</dd>
          </div>
          <div>
            <dt className="label text-on-brand-soft">Where</dt>
            <dd className="mt-2">
              {SITE.venue.name}
              <br />
              {SITE.venue.address}
            </dd>
          </div>
        </dl>

        <div className="grid content-start gap-6 md:col-span-3">
          <div>
            <p className="label text-on-brand-soft">Write</p>
            <a
              href={`mailto:${SITE.contact.email}`}
              className="mt-2 inline-block underline-offset-4 hover:underline"
            >
              {SITE.contact.email}
            </a>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {SITE.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="label text-on-brand-soft hover:text-on-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
