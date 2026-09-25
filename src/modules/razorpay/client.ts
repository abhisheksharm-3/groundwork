/**
 * Razorpay's REST API over fetch. Credentials are read here and nowhere else in
 * the module, and `null` from `publicKeyId` means the site is not configured to
 * take money yet, which the checkout page says out loud.
 */
import "server-only";
import { Buffer } from "node:buffer";
import { setTimeout as sleep } from "node:timers/promises";
import type { z } from "zod";
import { ENV } from "@/lib/env";
import { CONFIRMED_NOTE, RAZORPAY } from "./constants";
import { RazorpayOrderSchema, RazorpayPaymentSchema } from "./schemas";
import { paymentMessage, verifyHmacHex } from "./signature";
import type { RazorpayOrderType, RazorpayPaymentType } from "./types";

/** All three keys, or null. Without the webhook secret no payment could ever be confirmed, so it counts as unconfigured. */
function credentials(): {
  id: string;
  secret: string;
  webhookSecret: string;
} | null {
  const {
    RAZORPAY_KEY_ID: id,
    RAZORPAY_KEY_SECRET: secret,
    RAZORPAY_WEBHOOK_SECRET: webhookSecret,
  } = ENV;
  if (!id || !secret || !webhookSecret) return null;
  return { id, secret, webhookSecret };
}

export function publicKeyId(): string | null {
  return credentials()?.id ?? null;
}

/** A timeout, a rate limit or a 5xx is worth one more try; a 4xx is not. */
function isTransient(status: unknown): boolean {
  return (
    status === undefined ||
    status === 429 ||
    (typeof status === "number" && status >= 500)
  );
}

/** Every response is parsed, so a shape Razorpay changes fails here, loudly, not three calls later. */
async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const keys = credentials();
  if (!keys) throw new Error("Razorpay keys are not configured");
  const response = await fetch(`${RAZORPAY.apiBase}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Basic ${Buffer.from(`${keys.id}:${keys.secret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(RAZORPAY.timeoutMs),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Razorpay ${path} failed: ${response.status} ${detail}`, {
      cause: response.status,
    });
  }
  return schema.parse(await response.json());
}

/** One retry on a transient failure. Used for the reads that happen after money has been taken. */
async function requestWithRetry<T>(
  path: string,
  schema: z.ZodType<T>,
): Promise<T> {
  try {
    return await request(path, schema);
  } catch (error) {
    if (!(error instanceof Error) || !isTransient(error.cause)) throw error;
    await sleep(RAZORPAY.retryDelayMs);
    return request(path, schema);
  }
}

/** Notes are stored on the order and handed back at confirmation, which is how a buyer is confirmed without a database. */
export function createOrder(input: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrderType> {
  return request("/orders", RazorpayOrderSchema, {
    method: "POST",
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: RAZORPAY.currency,
      receipt: input.receipt.slice(0, RAZORPAY.receiptMaxLength),
      notes: input.notes,
    }),
  });
}

export function fetchOrder(orderId: string): Promise<RazorpayOrderType> {
  return requestWithRetry(
    `/orders/${encodeURIComponent(orderId)}`,
    RazorpayOrderSchema,
  );
}

export function fetchPayment(paymentId: string): Promise<RazorpayPaymentType> {
  return requestWithRetry(
    `/payments/${encodeURIComponent(paymentId)}`,
    RazorpayPaymentSchema,
  );
}

/**
 * Stamps the payment confirmed, after the mails. If the stamp fails, a retry
 * sends duplicate mails, which is the harmless direction: stamping first and then
 * failing the mails would leave a buyer charged and told nothing.
 */
export async function markPaymentConfirmed(paymentId: string): Promise<void> {
  await request(
    `/payments/${encodeURIComponent(paymentId)}`,
    RazorpayPaymentSchema,
    {
      method: "PATCH",
      body: JSON.stringify({
        notes: { [CONFIRMED_NOTE]: new Date().toISOString() },
      }),
    },
  );
}

/** The checkout return's signature, under the API key secret. */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const keys = credentials();
  return keys
    ? verifyHmacHex(paymentMessage(orderId, paymentId), signature, keys.secret)
    : false;
}

/** The webhook's signature: the raw body under the webhook secret, a different secret from the API key. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  return verifyHmacHex(rawBody, signature, ENV.RAZORPAY_WEBHOOK_SECRET ?? "");
}
