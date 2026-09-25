# Groundwork build report

Built 2026-09-25 against `.polaris/specs/2026-09-12-client-site-template-spec.md`, in ten
slices, each ending green on `npm run check` and pushed to
https://github.com/abhisheksharm-3/groundwork.

## State at the end

- `npm run check`: 8 check files pass (pricing, rate limit, env parity, security headers,
  Razorpay price and signature, RLS schema, module manifest).
- `npm run e2e`: 12 of 12 on desktop and a Pixel 7, on the template and again inside a
  fully stripped project.
- Strip matrix: all seven setup runs pass setup and `next build`, each leaving one commit
  and no mention of what it removed. A planted leak fails setup with the file and line.

## Criteria

| Group | Result |
|---|---|
| A. Fresh clone | A1, A3 to A9 pass. A2 changed: optional secrets are blank, not placeholders. |
| B. Razorpay | B1 to B9 pass. B10, a real payment end to end, not run: it needs the account's test keys and a public webhook URL. |
| C. Supabase | C1 to C3 and C5 pass. C4, live session refresh, not run: it needs a real project. C6 to C8 changed: there is no admin client. |
| D. Email | D1 to D4 pass. D5 and D6 changed: templates live with the module that sends them. |
| E. Forms | E1 to E7 pass. |
| F. Security | F2 to F4 and F6 to F8 pass, with the CSP finding below. F1 and F5 changed with the Supabase design. |
| G. Setup | G1 to G11 pass. |
| H. Design | H1 to H4 pass. H5: `/brand` is written but has not been run on a real client PDF. |
| I. Next 16.3 | I1 changed, I2 to I8 pass; I5's retry is by construction, not exercised by a throw. |
| J. React 19.3 | J1 to J4 pass; J1 and J2 changed. |

## Where the build departs from the spec, and why

Each was measured or read from the bundled 16.3 docs, not assumed.

**CSP.** Scripts must allow `'unsafe-inline'`. The App Router ships its RSC payload and
every Suspense reveal as inline scripts; under `script-src 'self'` the passes page never
hydrated and its prices never arrived. Next's own CSP guide shows that policy next to SRI
without saying so. SRI covers 7 of 11 external scripts in 16.3.5.

**Trusted Types.** Turbopack's chunk loader writes plain strings to `script.src`, and
Turbopack has no equivalent of webpack's `output.trustedTypes`. Lazily loaded chunks were
silently blocked, and navigation fell back to full reloads. A strict inline default policy
now signs same-origin `/_next/` script URLs only; injected HTML is still blocked.
Razorpay's `checkout.js` writes `innerHTML`, so `/checkout/*` alone drops the
requirement, through a module-declared exemption that a check forbids from touching
framing, plugin or base-uri protection.

**View transitions.** Each page wraps itself, not the layout: a layout persists across
navigations, so its enter and exit never fire. Links carry `transitionTypes` rather than
calling `addTransitionType` by hand.

**`error.tsx`** is the plain file convention. In 16.3 it already receives `retry` and
needs no `catchError` wrapper, which the bundled docs say outright. `catchError` wraps the
checkout widget instead.

**Stack.** No `razorpay` or `resend` SDKs: each is a few `fetch` calls, as absi already
did in production. No `next-themes`: the theme is chosen from the brief's scene, and it
would have added an inline script to police. No `tsx`: setup runs on Node 24's type
stripping. `cn` replaces `clsx` and `tailwind-merge`.

**Supabase.** No browser client and no admin client. All auth runs through Server
Actions, and nothing needed the service-role key. The keys follow Supabase's current
naming, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and sessions are checked with
`getClaims`. The proxy matches the account pages only, so marketing pages stay static.

**Modules.** Lines a module owns in shared files sit under `@module` markers, found by
scanning rather than listed. Modules plug into the core through a typed object of
optional capabilities in `registry.ts` and never import each other. The contact form is
core, not a module.

## Found and fixed during the build

- A fresh clone's `npm run check` failed: route types and `next-env.d.ts` are generated.
  The gate now runs `next typegen` first.
- Stale incremental type-check state hid new routes from `next build`. Incremental
  checking is off; TypeScript 7 checks the project in about 300ms.
- The contact form shipped 396 KB of Zod to the browser to read one constant.
- An installed but unconfigured Supabase module made a fresh clone's contact form report
  a failure. Unconfigured capabilities now answer false.
- The signature check did not cover the one input its hex guard exists for: a valid
  digest with non-hex bytes appended. absi's `razorpay.check.mts` has the same gap.
- `absi/src/app/error.tsx` wraps itself in `catchError`, which the 16.3 docs say is
  unnecessary.

## Not done

- A real Razorpay test payment through the webhook (B10) and a live Supabase session
  (C4). Both need credentials this build does not hold.
- `/brand` on a real client PDF (H5).
