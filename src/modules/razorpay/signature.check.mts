/**
 * The signature check. A refactor that dropped the hex guard, the length compare
 * or the constant-time compare would fail open in silence, so every rejection
 * path is exercised here.
 */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { paymentMessage, verifyHmacHex } from "./signature.ts";

const SECRET = "check_secret_value";
const sign = (message: string, secret = SECRET) =>
  createHmac("sha256", secret).update(message).digest("hex");

const message = paymentMessage("order_ABC123", "pay_XYZ789");
assert.equal(message, "order_ABC123|pay_XYZ789");
const valid = sign(message);

assert.ok(
  verifyHmacHex(message, valid, SECRET),
  "the exact digest is accepted",
);
assert.ok(
  verifyHmacHex(message, valid.toUpperCase(), SECRET),
  "an upper-cased digest is accepted",
);

for (const [what, signature] of [
  ["empty", ""],
  ["not hex", "zzzz"],
  ["odd length", valid.slice(0, 63)],
  ["truncated", valid.slice(0, 32)],
  ["trailing byte", `${valid}00`],
  ["all zeroes", "0".repeat(64)],
  ["hex then junk", `${valid.slice(0, 62)}zz`],
  ["valid digest then junk", `${valid}zz`],
  ["wrong secret", sign(message, "other_secret")],
  ["separator omitted", sign("order_ABC123pay_XYZ789")],
] as const) {
  assert.equal(
    verifyHmacHex(message, signature, SECRET),
    false,
    `signature "${what}" must be rejected`,
  );
}

assert.equal(
  verifyHmacHex(paymentMessage("pay_XYZ789", "order_ABC123"), valid, SECRET),
  false,
  "swapped ids are rejected",
);
assert.equal(
  verifyHmacHex(message, valid, ""),
  false,
  "an empty secret accepts nothing",
);

const body = '{"event":"payment.captured"}';
assert.ok(verifyHmacHex(body, sign(body), SECRET), "a webhook body verifies");
assert.equal(
  verifyHmacHex(`${body} `, sign(body), SECRET),
  false,
  "one appended space invalidates it",
);
