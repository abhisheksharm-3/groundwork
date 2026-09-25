/**
 * Buying one pass. Every pass's page prerenders at build, so the navigation from
 * the passes page is instant; only today's price streams in.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { PageMast } from "@/components/site/PageMast";
import { PageTransition } from "@/components/site/PageTransition";
import { PassPrice, PriceFallback } from "@/components/site/PassPrice";
import { findPass } from "@/lib/pricing";
import { SITE } from "@/lib/site-config";
import { publicKeyId } from "@/modules/razorpay/client";
import { CheckoutBoundary } from "@/modules/razorpay/components/CheckoutBoundary";
import { CheckoutForm } from "@/modules/razorpay/components/CheckoutForm";
import type { CheckoutParamsType } from "@/modules/razorpay/types";

export function generateStaticParams(): CheckoutParamsType[] {
  return SITE.passes.map((pass) => ({ pass: pass.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/checkout/[pass]">): Promise<Metadata> {
  const pass = findPass((await params).pass);
  return { title: pass ? `Buy the ${pass.name.toLowerCase()}` : "Checkout" };
}

export default async function CheckoutPage({
  params,
}: PageProps<"/checkout/[pass]">): Promise<ReactNode> {
  const pass = findPass((await params).pass);
  if (!pass) notFound();
  const isTakingPayments = publicKeyId() !== null;

  return (
    <PageTransition>
      <PageMast eyebrow="Checkout" title={pass.name} lede={pass.summary} />
      <section
        aria-label="Your pass"
        className="page grid gap-12 py-section md:grid-cols-12"
      >
        <div className="md:col-span-4">
          <div className="rounded-lg bg-brand-tint p-8">
            <Suspense fallback={<PriceFallback />}>
              <PassPrice pass={pass} />
            </Suspense>
            <ul className="mt-8 grid gap-3">
              {pass.includes.map((item) => (
                <li key={item} className="text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          {isTakingPayments ? (
            <CheckoutBoundary>
              <CheckoutForm passId={pass.id} passName={pass.name} />
            </CheckoutBoundary>
          ) : (
            <p
              role="status"
              className="rounded-lg bg-surface p-8 text-lg shadow-lift"
            >
              Online payment is not switched on yet. Write to{" "}
              <a
                href={`mailto:${SITE.contact.email}`}
                className="text-brand underline underline-offset-4"
              >
                {SITE.contact.email}
              </a>{" "}
              and we will book your pass directly.
            </p>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
