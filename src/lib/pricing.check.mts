/**
 * The early-rate boundary. A pass bought one second after the cutoff must be
 * charged the regular price, and one bought at the cutoff the early price.
 */
import assert from "node:assert/strict";
import { findPass, isEarlyRate, priceFor } from "./pricing.ts";
import { SITE } from "./site-config.ts";

const cutoff = Date.parse(SITE.earlyUntil);
assert.ok(Number.isFinite(cutoff), "earlyUntil must be a parseable ISO date");

assert.equal(
  isEarlyRate(cutoff),
  true,
  "the cutoff instant itself is still early",
);
assert.equal(
  isEarlyRate(cutoff + 1000),
  false,
  "one second after the cutoff is regular",
);

for (const pass of SITE.passes) {
  assert.ok(
    pass.earlyPrice <= pass.price,
    `${pass.id}: early price above regular`,
  );
  assert.equal(priceFor(pass, cutoff), pass.earlyPrice);
  assert.equal(priceFor(pass, cutoff + 1000), pass.price);
  assert.equal(findPass(pass.id), pass);
}

for (const hostile of ["__proto__", "constructor", "toString", "", "DAY"]) {
  assert.equal(
    findPass(hostile),
    undefined,
    `"${hostile}" must not resolve to a pass`,
  );
}
