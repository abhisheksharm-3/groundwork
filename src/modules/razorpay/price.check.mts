/** The server price table: every pass in paise on both sides of the cutoff, and nothing for an id that is not a pass. */
import assert from "node:assert/strict";
import { SITE } from "../../lib/site-config.ts";
import { amountPaise } from "./price.ts";

const cutoff = Date.parse(SITE.earlyUntil);

for (const pass of SITE.passes) {
  assert.equal(
    amountPaise(pass.id, cutoff),
    pass.earlyPrice * 100,
    `${pass.id} early`,
  );
  assert.equal(
    amountPaise(pass.id, cutoff + 1000),
    pass.price * 100,
    `${pass.id} regular`,
  );
  assert.ok(
    Number.isInteger(amountPaise(pass.id, cutoff)),
    `${pass.id} is whole paise`,
  );
}

for (const hostile of [
  "__proto__",
  "constructor",
  "hasOwnProperty",
  "",
  "day ",
  "../day",
]) {
  assert.throws(
    () => amountPaise(hostile, cutoff),
    /Unknown pass/,
    `"${hostile}" must not price`,
  );
}
