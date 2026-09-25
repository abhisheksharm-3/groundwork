/** When a pass can be refunded and how. The deadlines are computed from the event's first day. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageMast } from "@/components/site/PageMast";
import { PageTransition } from "@/components/site/PageTransition";
import { Prose } from "@/components/site/Prose";
import { formatDayMonth } from "@/lib/format";
import { refundDeadline } from "@/lib/policy-dates";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Refunds and cancellation" };

export default function RefundsPage(): ReactNode {
  const { refunds, contact } = SITE;
  return (
    <PageTransition>
      <PageMast
        eyebrow={`Updated ${formatDayMonth(SITE.policiesUpdated)}`}
        title="Refunds and cancellation"
        lede="Plans change. This is what we can give back, and when."
      />
      <Prose>
        <h2>Cancelling your pass</h2>
        <ul>
          <li>Until {refundDeadline(refunds.fullUntilDays)}: a full refund.</li>
          <li>
            From then until {refundDeadline(refunds.halfUntilDays)}: half the
            price back, or transfer the pass to someone else at no charge.
          </li>
          <li>After that: no refund, but the pass can still be transferred.</li>
        </ul>
        <h2>If we cancel</h2>
        <p>
          If the event is cancelled or moved, you can have the full price back,
          whenever you bought the pass.
        </p>
        <h2>How to ask</h2>
        <p>
          Write to <a href={`mailto:${contact.email}`}>{contact.email}</a> with
          the payment reference from your confirmation email. Refunds go back to
          the card, UPI account or bank you paid from, within{" "}
          {refunds.processingDays} of our reply.
        </p>
      </Prose>
    </PageTransition>
  );
}
