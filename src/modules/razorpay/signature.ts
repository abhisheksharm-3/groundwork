/**
 * Constant-time verification of Razorpay's hex HMAC-SHA256 signatures.
 *
 * Pure, with the secret passed in, and deliberately without `server-only`: this
 * is the only thing between a real payment and a forged one, so the check file
 * imports it directly and exercises every rejection path.
 */
import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";

const HEX = /^[0-9a-f]+$/i;

/**
 * True only for the exact digest of `message` under `secret`. An empty secret
 * rejects everything. The shape is checked before the length and the length
 * before the compare, because `Buffer.from(s, "hex")` silently truncates at the
 * first non-hex byte, which would let a padded forgery reach the compare.
 */
export function verifyHmacHex(
  message: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret || !HEX.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(message).digest();
  const given = Buffer.from(signature, "hex");
  return given.length === expected.length && timingSafeEqual(expected, given);
}

/** What Razorpay signs for a checkout payment: the order and payment ids, pipe-joined. */
export function paymentMessage(orderId: string, paymentId: string): string {
  return `${orderId}|${paymentId}`;
}
