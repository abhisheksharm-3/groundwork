/** The terms a pass is sold on. Razorpay reviews this page before activating a live account. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageMast } from "@/components/site/PageMast";
import { PageTransition } from "@/components/site/PageTransition";
import { Prose } from "@/components/site/Prose";
import { formatDayMonth } from "@/lib/format";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage(): ReactNode {
  const { organiser, contact } = SITE;
  return (
    <PageTransition>
      <PageMast
        eyebrow={`Updated ${formatDayMonth(SITE.policiesUpdated)}`}
        title="Terms"
        lede={`The terms on which ${organiser.legalName} sells passes for ${SITE.name} ${SITE.edition}.`}
      />
      <Prose>
        <h2>Who you are buying from</h2>
        <p>
          {organiser.legalName}, {organiser.address}. Questions go to{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a>.
        </p>
        <h2>Your pass</h2>
        <p>
          A pass admits the person named on it on the days it covers,{" "}
          {SITE.dates.label}, at {SITE.venue.name}. Show the confirmation email
          or its reference at the desk. A pass may be transferred to someone
          else by writing to us before the event; it may not be resold for more
          than was paid.
        </p>
        <h2>Prices</h2>
        <p>
          Prices are in Indian rupees and include GST. The price charged is the
          one shown when you pay.
        </p>
        <h2>Changes to the programme</h2>
        <p>
          Sessions and speakers can change. If the event is cancelled or moved
          to new dates, you can have a full refund or keep your pass for the new
          dates.
        </p>
        <h2>On the day</h2>
        <p>
          Follow the instructions of the organisers and the people running each
          floor. Anyone who puts others at risk may be asked to leave without a
          refund.
        </p>
        <h2>Liability</h2>
        <p>
          Nothing here limits liability that the law does not allow to be
          limited. Otherwise our liability for a pass is limited to what you
          paid for it.
        </p>
        <h2>Law</h2>
        <p>
          These terms are governed by the laws of India, and the courts of{" "}
          {organiser.city} have jurisdiction.
        </p>
      </Prose>
    </PageTransition>
  );
}
