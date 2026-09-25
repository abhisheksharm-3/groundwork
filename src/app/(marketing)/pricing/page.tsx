/**
 * The passes, laid out as ticket stubs. Everything but the price prerenders into
 * the instant shell; the price depends on today's date against the early-rate
 * cutoff, so it streams in behind a Suspense boundary.
 */
import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { ActionLink } from "@/components/site/ActionLink";
import { PageMast } from "@/components/site/PageMast";
import { PageTransition } from "@/components/site/PageTransition";
import { PassPrice, PriceFallback } from "@/components/site/PassPrice";
import { formatDayMonth } from "@/lib/format";
import { SITE } from "@/lib/site-config";
import type { PassType } from "@/types/site";

export const metadata: Metadata = {
  title: "Passes",
  description: `Day passes, both-day passes and patron passes for ${SITE.name} ${SITE.edition}. Early rates until ${formatDayMonth(SITE.earlyUntil)}.`,
};

export default function PassesPage(): ReactNode {
  return (
    <PageTransition>
      <PageMast
        eyebrow={`Early rates until ${formatDayMonth(SITE.earlyUntil)}`}
        title="Choose a pass"
        lede="Every pass includes lunch from the mill canteen and the run of all three floors. The patron pass also pays a weaver's fee for the cloth made at the gathering."
      />
      <section aria-label="Passes" className="page py-section">
        <ol className="grid gap-8">
          {SITE.passes.map((pass) => (
            <PassTicket key={pass.id} pass={pass} />
          ))}
        </ol>
        <p className="mt-12 max-w-(--container-prose) text-ink-soft">
          Students and working craftspeople get a day pass free. Write to{" "}
          <a
            href={`mailto:${SITE.contact.email}`}
            className="text-brand underline underline-offset-4"
          >
            {SITE.contact.email}
          </a>{" "}
          with where you study or work.
        </p>
      </section>
    </PageTransition>
  );
}

function PassTicket({ pass }: { pass: PassType }): ReactNode {
  return (
    <li className="grid overflow-hidden rounded-lg bg-surface shadow-lift md:grid-cols-[1fr_minmax(16rem,22rem)]">
      <div className="p-8 md:p-12">
        <h2 className="text-2xl">{pass.name}</h2>
        <p className="mt-3 text-lg text-ink-soft">{pass.summary}</p>
        <ul className="mt-8 grid gap-3">
          {pass.includes.map((item) => (
            <li key={item} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-brand"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col justify-between gap-8 border-t-2 border-dashed border-brand-soft bg-brand-tint p-8 md:border-t-0 md:border-l-2 md:p-10">
        <Suspense fallback={<PriceFallback />}>
          <PassPrice pass={pass} />
        </Suspense>
        <BuyLink pass={pass} />
      </div>
    </li>
  );
}

function BuyLink({ pass }: { pass: PassType }): ReactNode {
  if (!SITE.checkout) {
    return <ActionLink href="/contact">Ask about this pass</ActionLink>;
  }
  return <ActionLink href={SITE.checkout(pass.id)}>Buy this pass</ActionLink>;
}
