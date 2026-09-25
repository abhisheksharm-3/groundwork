/** The programme: both days as a timetable, and who runs the gathering. */
import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import stamping from "@/assets/images/stamping.jpg";
import swatches from "@/assets/images/swatches.jpg";
import { ActionLink } from "@/components/site/ActionLink";
import { PageMast } from "@/components/site/PageMast";
import { PageTransition } from "@/components/site/PageTransition";
import { Reveal } from "@/components/site/Reveal";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Programme",
  description: `Two days of talks, open floors and hands-on sessions at ${SITE.venue.name}, ${SITE.dates.label}.`,
};

type SessionType = { time: string; title: string; where: string };

const DAYS: readonly {
  day: string;
  date: string;
  sessions: readonly SessionType[];
}[] = [
  {
    day: "Saturday",
    date: "20 February",
    sessions: [
      {
        time: "09:30",
        title: "Doors, chai, and the floors open",
        where: "Everywhere",
      },
      { time: "10:30", title: "Why a mill, and why now", where: "The shed" },
      {
        time: "11:30",
        title: "Warping a pit loom, start to finish",
        where: "Ground floor",
      },
      { time: "13:00", title: "Lunch from the canteen", where: "The yard" },
      {
        time: "14:30",
        title: "Keeping an indigo vat alive for a year",
        where: "First floor",
      },
      {
        time: "16:00",
        title: "Hands-on sessions, first sitting",
        where: "All floors",
      },
      {
        time: "19:30",
        title: "Supper under the saw-tooth roof",
        where: "The shed",
      },
    ],
  },
  {
    day: "Sunday",
    date: "21 February",
    sessions: [
      {
        time: "09:30",
        title: "Doors, and the vats are already warm",
        where: "Everywhere",
      },
      {
        time: "10:30",
        title: "Three generations of block carvers",
        where: "The yard",
      },
      { time: "12:00", title: "Pricing handwork honestly", where: "The shed" },
      { time: "13:00", title: "Lunch from the canteen", where: "The yard" },
      {
        time: "14:30",
        title: "Hands-on sessions, second sitting",
        where: "All floors",
      },
      {
        time: "17:00",
        title: "The patrons' cloth comes off the loom",
        where: "Ground floor",
      },
    ],
  },
];

export default function ProgrammePage(): ReactNode {
  return (
    <PageTransition>
      <PageMast
        eyebrow={`${SITE.dates.label} · ${SITE.venue.name}`}
        title="Two days, three floors, one yard"
        lede="Talks run in the shed. The floors stay open all day, and you can walk away from a talk to watch a vat instead. Nobody will mind."
      />

      <section
        aria-label="Timetable"
        className="page grid gap-16 py-section md:grid-cols-2 md:gap-12"
      >
        {DAYS.map((day) => (
          <div key={day.day}>
            <h2 className="flex items-baseline justify-between border-b border-ink pb-4 text-2xl">
              {day.day}
              <span className="label text-ink-soft">{day.date}</span>
            </h2>
            <ol>
              {day.sessions.map((session) => (
                <li
                  key={session.time}
                  className="grid grid-cols-[4.5rem_1fr] gap-x-4 border-b py-4 md:grid-cols-[5rem_1fr_auto]"
                >
                  <time className="label pt-1 text-brand tabular-nums">
                    {session.time}
                  </time>
                  <span>{session.title}</span>
                  <span className="label col-start-2 mt-1 text-ink-soft md:col-start-3 md:mt-0 md:pt-1">
                    {session.where}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <section aria-labelledby="trust" className="bg-ground-alt">
        <div className="page grid gap-10 py-section md:grid-cols-12 md:items-center">
          <Reveal>
            <figure className="md:col-span-5">
              <Image
                src={stamping}
                alt="A printer's hand pressing a block onto cloth in low light"
                placeholder="blur"
                sizes="(min-width: 48rem) 40vw, 100vw"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            </figure>
            <div className="md:col-span-6 md:col-start-7">
              <p className="label text-brand">Who runs it</p>
              <h2 id="trust" className="mt-4 text-3xl">
                A trust of eleven craftspeople and one accountant.
              </h2>
              <p className="mt-6 max-w-(--container-prose) text-ink-soft">
                Weft is run by the people who teach at it. Pass money pays the
                weavers, dyers and printers a day rate first; whatever is left
                keeps the shed's roof on.
              </p>
              <div className="mt-8">
                <ActionLink href="/pricing">See the passes</ActionLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <figure className="page py-section">
        <Image
          src={swatches}
          alt="A wall of indigo shibori squares, each a different fold and tie"
          placeholder="blur"
          sizes="100vw"
          className="aspect-[21/9] w-full rounded-lg object-cover"
        />
        <figcaption className="label mt-4 text-ink-soft">
          Last year's vat, square by square.
        </figcaption>
      </figure>
    </PageTransition>
  );
}
