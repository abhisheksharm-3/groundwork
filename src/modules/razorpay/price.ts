/**
 * The amount an order is created for. Derived here, on the server, from the pass
 * id and the server clock; the checkout form posts a pass id and nothing about
 * money, so there is nothing a client could send to change the price.
 */
import { findPass, priceFor } from "../../lib/pricing.ts";

/** Paise. Throws for a pass id that does not exist. */
export function amountPaise(passId: string, now: number): number {
  const pass = findPass(passId);
  if (!pass) throw new Error(`Unknown pass "${passId}"`);
  return priceFor(pass, now) * 100;
}
