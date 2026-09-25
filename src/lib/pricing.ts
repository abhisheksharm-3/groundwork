/**
 * Which price a pass sells at, and when. The one place the early-rate cutoff is
 * decided: the passes page and the Razorpay order action both call it, so the
 * page can never quote a price the order will not charge.
 */
import { type PassType, SITE } from "./site-config.ts";

const EARLY_UNTIL = Date.parse(SITE.earlyUntil);

export function isEarlyRate(now: number): boolean {
  return now <= EARLY_UNTIL;
}

/** Whole rupees. */
export function priceFor(pass: PassType, now: number): number {
  return isEarlyRate(now) ? pass.earlyPrice : pass.price;
}

/** Looked up by equality over the list, never by key, so `__proto__` finds nothing. */
export function findPass(id: string): PassType | undefined {
  return SITE.passes.find((pass) => pass.id === id);
}
