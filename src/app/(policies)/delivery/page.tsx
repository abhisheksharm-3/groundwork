/** How a pass reaches the buyer. Razorpay asks for a delivery policy even when nothing ships. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageMast } from "@/components/site/PageMast";
import { PageTransition } from "@/components/site/PageTransition";
import { Prose } from "@/components/site/Prose";
import { formatDayMonth } from "@/lib/format";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Delivery" };

export default function DeliveryPage(): ReactNode {
  return (
    <PageTransition>
      <PageMast
        eyebrow={`Updated ${formatDayMonth(SITE.policiesUpdated)}`}
        title="Delivery"
        lede="Passes are digital. Nothing is posted."
      />
      <Prose>
        <h2>How your pass arrives</h2>
        <p>
          Once your payment clears, a confirmation email with your pass and its
          reference is sent to the address you gave, usually within minutes.
          That email is your pass; show it at the desk at {SITE.venue.name}.
        </p>
        <h2>If it does not arrive</h2>
        <p>
          Check your spam folder first. If there is nothing after an hour, write
          to <a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a>{" "}
          with the payment reference Razorpay sent you, and we will resend it.
        </p>
      </Prose>
    </PageTransition>
  );
}
