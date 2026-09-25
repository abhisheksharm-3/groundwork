/** The limiter's contract: exactly `limit` calls per window, per key, then a clean reset. */
import assert from "node:assert/strict";
import { createRateLimiter } from "./rate-limit.ts";

const allow = createRateLimiter({ limit: 10, windowMs: 60_000 });
const start = 1_000_000;

for (let call = 1; call <= 10; call++) {
  assert.equal(
    allow("203.0.113.7", start + call),
    true,
    `call ${call} is inside the allowance`,
  );
}
assert.equal(
  allow("203.0.113.7", start + 11),
  false,
  "the eleventh call is refused",
);
assert.equal(
  allow("198.51.100.2", start + 12),
  true,
  "another address has its own allowance",
);
assert.equal(
  allow("203.0.113.7", start + 59_999),
  false,
  "still refused inside the window",
);
assert.equal(
  allow("203.0.113.7", start + 60_001),
  true,
  "a new window resets the count",
);

const separate = createRateLimiter({ limit: 1, windowMs: 60_000 });
assert.equal(
  separate("203.0.113.7", start),
  true,
  "limiters do not share counters",
);
