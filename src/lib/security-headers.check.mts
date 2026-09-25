/**
 * The CSP's non-negotiables. A module adding a source must never be able to
 * reopen framing, add eval in production, or drop Trusted Types.
 */
import assert from "node:assert/strict";
import { buildCsp, securityHeaders } from "./security-headers.ts";

const directives = (csp: string) =>
  new Map(
    csp.split("; ").map((part) => {
      const [name, ...sources] = part.split(" ");
      return [name, sources] as const;
    }),
  );

const payments = {
  "script-src": ["https://checkout.example.com"],
  "frame-src": ["https://api.example.com"],
};
const prod = directives(buildCsp([payments], false));
const dev = directives(buildCsp([payments], true));

assert.deepEqual(prod.get("frame-ancestors"), ["'none'"]);
assert.deepEqual(prod.get("object-src"), ["'none'"]);
assert.deepEqual(prod.get("require-trusted-types-for"), ["'script'"]);
assert.ok(
  !prod.get("script-src")?.includes("'unsafe-eval'"),
  "no eval in production",
);
assert.ok(
  dev.get("script-src")?.includes("'unsafe-eval'"),
  "eval only in development",
);

assert.ok(
  prod.get("script-src")?.includes("https://checkout.example.com"),
  "module script source merged",
);
assert.deepEqual(
  prod.get("frame-src"),
  ["https://api.example.com"],
  "a module source replaces 'none'",
);
assert.deepEqual(
  directives(buildCsp([], false)).get("frame-src"),
  ["'none'"],
  "no module, no frames",
);

const once = buildCsp([payments, payments], false);
assert.equal(
  once,
  buildCsp([payments], false),
  "a source listed twice appears once",
);

const names = securityHeaders(buildCsp([], false)).map((header) => header.key);
for (const required of [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Referrer-Policy",
]) {
  assert.ok(names.includes(required), `${required} is set`);
}
