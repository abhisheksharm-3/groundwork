/** Every fixed value in the payment path. Nothing here is a secret; the secrets are env vars. */
import type { ConfirmReasonType } from "./types";

export const RAZORPAY = {
  apiBase: "https://api.razorpay.com/v1",
  checkoutScript: "https://checkout.razorpay.com/v1/checkout.js",
  currency: "INR",
  /** Long enough for a slow gateway, short enough to leave the function time to answer. */
  timeoutMs: 10_000,
  retryDelayMs: 700,
  /** Razorpay caps a receipt at 40 characters and a note value at 256. */
  receiptMaxLength: 40,
  noteMaxLength: 250,
} as const;

/**
 * Stamped on a payment's notes once its mails have gone out. Durable idempotency
 * with no store of our own: Razorpay keeps the payment forever, so the stamp
 * survives a redeploy and a replay hours later.
 */
export const CONFIRMED_NOTE = "site_confirmed_at";

export const CAPTURED = "captured";

/** The only webhook event that may confirm. `payment.authorized` arrives for the same payment milliseconds earlier. */
export const CAPTURED_EVENT = "payment.captured";

/**
 * Failures worth asking Razorpay to redeliver. Razorpay retries a non-2xx for 24
 * hours and then disables the webhook, so a failure that can never succeed must
 * answer 2xx. An uncaptured payment is the case that matters: redelivery will not
 * capture it, and a real capture arrives as its own event.
 */
export const RETRYABLE_REASONS: ReadonlySet<ConfirmReasonType> = new Set([
  "payment-unreadable",
  "order-unreadable",
  "mail-failed",
]);
