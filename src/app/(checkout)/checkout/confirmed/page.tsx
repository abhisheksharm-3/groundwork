/**
 * Where Checkout sends the buyer after paying. It verifies the signature so it
 * can state the payment reference, and it confirms nothing: the receipt is sent
 * by the webhook, which also covers a buyer who closed the tab before landing here.
 */
import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { ActionLink } from "@/components/site/ActionLink";
import { PageTransition } from "@/components/site/PageTransition";
import { SITE } from "@/lib/site-config";
import { verifyPaymentSignature } from "@/modules/razorpay/client";
import type { PaymentReturnType } from "@/modules/razorpay/types";

export const metadata: Metadata = { title: "Payment received" };

export default function ConfirmedPage({
  searchParams,
}: PageProps<"/checkout/confirmed">): ReactNode {
  return (
    <PageTransition>
      <section className="on-brand">
        <div className="page flex min-h-[60svh] flex-col justify-center py-section">
          <Suspense
            fallback={
              <p className="label text-action">Checking your payment</p>
            }
          >
            <PaymentStatus searchParams={searchParams} />
          </Suspense>
        </div>
        <div className="selvedge text-action" />
      </section>
    </PageTransition>
  );
}

async function PaymentStatus({
  searchParams,
}: {
  searchParams: Promise<PaymentReturnType>;
}): Promise<ReactNode> {
  const { order = "", payment = "", signature = "" } = await searchParams;
  const isVerified = verifyPaymentSignature(order, payment, signature);

  if (!isVerified) {
    return (
      <>
        <p className="label text-action">We could not verify this payment</p>
        <h1 className="mt-5 max-w-[18ch] text-3xl">
          If you paid, your receipt is still on its way
        </h1>
        <p className="mt-6 max-w-(--container-prose) text-lg text-on-brand-soft">
          Receipts are sent from Razorpay's confirmation, not from this page. If
          nothing arrives within an hour, write to {SITE.contact.email}.
        </p>
      </>
    );
  }

  return (
    <>
      <p className="label text-action">Payment received</p>
      <h1 className="mt-5 max-w-[16ch] text-3xl">
        See you at {SITE.venue.name}
      </h1>
      <p className="mt-6 max-w-(--container-prose) text-lg text-on-brand-soft">
        Your receipt is on its way to your email. Your reference is{" "}
        <span className="font-sans font-semibold text-on-brand">{payment}</span>
        .
      </p>
      <div className="mt-10">
        <ActionLink href="/about" variant="action">
          See the programme
        </ActionLink>
      </div>
    </>
  );
}
