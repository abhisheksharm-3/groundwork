/**
 * The CSP's non-negotiables. A module adding sources, or exempting its own
 * routes from a directive, must never be able to reopen framing, add eval in
 * production, or drop Trusted Types anywhere but the routes it names.
 */
import assert from "node:assert/strict";
import {
  buildCsp,
  DEV_CSP,
  routeHeaders,
  securityHeaders,
} from "./security-headers.ts";

const directives = (csp: string) =>
  new Map(
    csp.split("; ").map((part) => {
      const [name, ...sources] = part.split(" ");
      return [name, sources] as const;
    }),
  );
const cspOf = (headers: { key: string; value: string }[]) =>
  headers.find((header) => header.key === "Content-Security-Policy")?.value ??
  "";

const payments = {
  "script-src": ["https://checkout.example.com"],
  "frame-src": ["https://api.example.com"],
};
const prod = directives(buildCsp([payments]));
const dev = directives(buildCsp([payments, DEV_CSP]));

assert.deepEqual(prod.get("frame-ancestors"), ["'none'"]);
assert.deepEqual(prod.get("object-src"), ["'none'"]);
assert.deepEqual(prod.get("require-trusted-types-for"), ["'script'"]);
assert.ok(
  !prod.get("script-src")?.includes("'unsafe-eval'"),
  "no eval in production",
);
assert.ok(
  dev.get("script-src")?.includes("'unsafe-eval'"),
  "eval only when DEV_CSP is added",
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
  directives(buildCsp([])).get("frame-src"),
  ["'none'"],
  "no module, no frames",
);
assert.equal(
  buildCsp([payments, payments]),
  buildCsp([payments]),
  "a source listed twice appears once",
);

const exemption = {
  source: "/checkout/:path*",
  drop: ["require-trusted-types-for"],
  reason: "test",
};
const rules = routeHeaders([payments], [exemption]);
assert.equal(
  rules[0]?.source,
  "/(.*)",
  "the full policy applies to every route first",
);
assert.ok(
  directives(cspOf(rules[0]?.headers ?? [])).has("require-trusted-types-for"),
  "Trusted Types everywhere by default",
);
const exempted = directives(cspOf(rules[1]?.headers ?? []));
assert.equal(rules[1]?.source, "/checkout/:path*");
assert.ok(
  !exempted.has("require-trusted-types-for"),
  "the exempted route drops only what it named",
);
assert.deepEqual(
  exempted.get("frame-ancestors"),
  ["'none'"],
  "the exempted route keeps framing protection",
);

for (const directive of [
  "frame-ancestors",
  "object-src",
  "base-uri",
  "default-src",
]) {
  assert.throws(
    () =>
      routeHeaders([], [{ source: "/x", drop: [directive], reason: "test" }]),
    /may not drop/,
    `an exemption may not drop ${directive}`,
  );
}

const names = securityHeaders(buildCsp([])).map((header) => header.key);
for (const required of [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Referrer-Policy",
]) {
  assert.ok(names.includes(required), `${required} is set`);
}
