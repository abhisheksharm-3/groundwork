/** How to reach the organisers. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageMast } from "@/components/site/PageMast";
import { PageTransition } from "@/components/site/PageTransition";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Write to us",
  description: `Questions about passes, access, or teaching at ${SITE.name}. A person reads every message.`,
};

export default function ContactPage(): ReactNode {
  return (
    <PageTransition>
      <PageMast
        eyebrow="A person reads every message"
        title="Write to us"
        lede="About passes, getting here, access on the floors, or teaching next year. We answer within two working days."
      />
      <section
        aria-label="Contact details"
        className="page grid gap-12 py-section md:grid-cols-12"
      >
        <dl className="grid content-start gap-8 md:col-span-4">
          <div>
            <dt className="label text-ink-soft">Email</dt>
            <dd className="mt-2 text-lg">
              <a
                href={`mailto:${SITE.contact.email}`}
                className="text-brand underline underline-offset-4"
              >
                {SITE.contact.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="label text-ink-soft">Phone</dt>
            <dd className="mt-2 text-lg">
              <a href={`tel:${SITE.contact.phone.replaceAll(" ", "")}`}>
                {SITE.contact.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="label text-ink-soft">The mill</dt>
            <dd className="mt-2 text-lg">
              {SITE.venue.name}
              <br />
              {SITE.venue.address}
            </dd>
          </div>
        </dl>
        <div className="md:col-span-7 md:col-start-6">
          <ContactForm />
        </div>
      </section>
    </PageTransition>
  );
}
