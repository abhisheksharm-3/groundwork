/** The home page: the gathering in one screen, its three crafts, the venue, and the way in. */

import { cn } from "cn";
import Image from "next/image";
import type { ReactNode } from "react";
import blocks from "@/assets/images/blocks.jpg";
import drying from "@/assets/images/drying.jpg";
import dyer from "@/assets/images/dyer.jpg";
import loom from "@/assets/images/loom.jpg";
import spools from "@/assets/images/spools.jpg";
import { ActionLink } from "@/components/site/ActionLink";
import { PageTransition } from "@/components/site/PageTransition";
import { Reveal } from "@/components/site/Reveal";
import { formatDayMonth, formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site-config";
import type { CraftType } from "@/types/site";

const CRAFTS: readonly CraftType[] = [
  {
    floor: "Ground floor · the loom",
    title: "Forty looms, and a bench at every one",
    body: "The mill's weaving shed runs on both days. Sit beside a weaver through a full warp change, then throw the shuttle yourself on the practice looms at the far end.",
    image: spools,
    alt: "Rows of undyed cotton thread on cones, waiting to be warped",
    layout:
      "md:[&>figure]:col-span-7 md:[&>div]:col-span-4 md:[&>div]:col-start-9",
  },
  {
    floor: "First floor · the vat",
    title: "Indigo, from leaf to cloth",
    body: "Two fermentation vats, kept alive since October. Dip a length of cotton, watch it come out green and turn blue in the air, and take it home.",
    image: dyer,
    alt: "A dyer bent over a sink between indigo-stained wooden vats",
    layout:
      "md:[&>figure]:order-2 md:[&>figure]:col-span-6 md:[&>figure]:col-start-7 md:[&>div]:col-span-5",
  },
  {
    floor: "The yard · the block",
    title: "Carved teak, printed by hand",
    body: "Block printers from Pethapur bring the blocks their families have carved for three generations. Register a repeat by eye, then try it on a length laid out for you.",
    image: blocks,
    alt: "A heap of hand-carved wooden printing blocks: elephants, paisleys, flowers",
    layout:
      "md:[&>figure]:col-span-8 md:[&>div]:col-span-3 md:[&>div]:col-start-10",
  },
];

export default function HomePage(): ReactNode {
  return (
    <PageTransition>
      <Hero />
      <Crafts />
      <Venue />
      <EarlyRate />
    </PageTransition>
  );
}

function Hero(): ReactNode {
  return (
    <section className="on-brand overflow-hidden">
      <div className="page grid gap-12 pt-[calc(var(--spacing-section)*0.55)] md:grid-cols-12 md:items-end md:gap-8">
        <div className="md:col-span-7 md:pb-section">
          <p className="label enter text-action">
            {SITE.dates.label} · {SITE.venue.city}
          </p>
          <h1 className="enter mt-6 text-display [--step:1]">{SITE.name}</h1>
          <p className="enter mt-8 max-w-[20ch] text-2xl [--step:2]">
            {SITE.tagline}
          </p>
          <div className="enter mt-10 flex flex-wrap items-center gap-x-8 gap-y-5 [--step:3]">
            <ActionLink href="/pricing" variant="action">
              Get a pass
            </ActionLink>
            <ActionLink href="/about" variant="quiet">
              See the programme
            </ActionLink>
          </div>
        </div>
        <figure className="enter relative md:col-span-5 md:h-[min(84svh,52rem)] [--step:2]">
          <Image
            src={loom}
            alt="A weaver at a pit loom, turmeric-yellow warp threads running over indigo cloth"
            priority
            placeholder="blur"
            sizes="(min-width: 48rem) 40vw, 100vw"
            className="aspect-[4/5] w-full rounded-t-lg object-cover md:aspect-auto md:h-full"
          />
          <figcaption className="label absolute bottom-4 left-4 rounded-sm bg-brand-deepest/80 px-3 py-2 text-on-brand-soft">
            At the loom, Ahmedabad
          </figcaption>
        </figure>
      </div>
      <div className="selvedge text-action" />
    </section>
  );
}

function Crafts(): ReactNode {
  return (
    <section aria-labelledby="crafts" className="py-section">
      <div className="page">
        <p className="label text-brand">What happens</p>
        <h2 id="crafts" className="mt-4 max-w-[22ch] text-3xl">
          Three crafts, a floor each, and you are allowed to touch.
        </h2>
      </div>
      <div className="page mt-[calc(var(--spacing-section)*0.6)] grid gap-y-[calc(var(--spacing-section)*0.8)]">
        <Reveal>
          {CRAFTS.map((craft) => (
            <article
              key={craft.floor}
              className={cn(
                "grid items-center gap-8 md:grid-cols-12",
                craft.layout,
              )}
            >
              <figure>
                <Image
                  src={craft.image}
                  alt={craft.alt}
                  placeholder="blur"
                  sizes="(min-width: 48rem) 60vw, 100vw"
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
              </figure>
              <div>
                <p className="label text-brand">{craft.floor}</p>
                <h3 className="mt-3 text-2xl">{craft.title}</h3>
                <p className="mt-4 text-ink-soft">{craft.body}</p>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Venue(): ReactNode {
  return (
    <section aria-labelledby="venue" className="bg-ground-alt">
      <div className="page grid gap-10 py-section md:grid-cols-12 md:items-center">
        <div className="md:col-span-5">
          <p className="label text-brand">Where</p>
          <h2 id="venue" className="mt-4 text-3xl">
            {SITE.venue.name}
          </h2>
          <p className="mt-6 max-w-(--container-prose) text-ink-soft">
            A weaving shed built in 1931 for a mill that closed in 1984,
            reopened by the trust that runs Weft. North light through a
            saw-tooth roof, a yard for drying, and a canteen that still feeds
            the neighbourhood.
          </p>
          <p className="mt-6">{SITE.venue.address}</p>
        </div>
        <figure className="md:col-span-6 md:col-start-7">
          <Image
            src={drying}
            alt="Shibori-dyed indigo lengths hanging to dry in a narrow yard"
            placeholder="blur"
            sizes="(min-width: 48rem) 45vw, 100vw"
            className="aspect-[4/5] w-full rounded-lg object-cover"
          />
        </figure>
      </div>
    </section>
  );
}

function EarlyRate(): ReactNode {
  const lowest = Math.min(...SITE.passes.map((pass) => pass.earlyPrice));
  return (
    <section aria-labelledby="early" className="on-brand">
      <div className="page flex flex-col gap-8 py-section md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label text-action">
            Early rates until {formatDayMonth(SITE.earlyUntil)}
          </p>
          <h2 id="early" className="mt-4 max-w-[18ch] text-3xl">
            Passes from {formatPrice(lowest)}, lunch included.
          </h2>
        </div>
        <ActionLink href="/pricing" variant="action">
          Choose a pass
        </ActionLink>
      </div>
    </section>
  );
}
