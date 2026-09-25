/**
 * Today's price for a pass. It reads the clock, so it renders per request and
 * belongs inside a Suspense boundary; the page around it stays in the static
 * shell. The passes page and the checkout page both use it, so they can never
 * quote different prices.
 */
import { connection } from "next/server";
import type { ReactNode } from "react";
import { formatDayMonth, formatPrice } from "@/lib/format";
import { isEarlyRate, priceFor } from "@/lib/pricing";
import { SITE } from "@/lib/site-config";
import type { PassPropsType } from "@/types/ui";

export async function PassPrice({ pass }: PassPropsType): Promise<ReactNode> {
  await connection();
  const now = Date.now();
  const price = priceFor(pass, now);
  const isDiscounted = isEarlyRate(now) && price < pass.price;
  return (
    <div>
      <p className="font-display text-3xl tabular-nums">{formatPrice(price)}</p>
      <p className="label mt-3 text-ink-soft">
        {isDiscounted ? (
          <>
            <s>{formatPrice(pass.price)}</s> after{" "}
            {formatDayMonth(SITE.earlyUntil)}
          </>
        ) : (
          "Including GST"
        )}
      </p>
    </div>
  );
}

export function PriceFallback(): ReactNode {
  return (
    <div aria-hidden="true">
      <div className="h-[var(--text-3xl)] w-2/3 animate-pulse rounded-md bg-brand-soft/60" />
      <div className="mt-3 h-[var(--text-xs)] w-1/2 animate-pulse rounded-sm bg-brand-soft/40" />
    </div>
  );
}
