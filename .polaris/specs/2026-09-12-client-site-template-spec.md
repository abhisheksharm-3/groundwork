# Client site template — design

A reusable Next.js starter that turns a client brief into a shipped site without
rebuilding the foundation each time. One `npx tsx setup.ts` run strips the modules
a given project does not need, so the repo that remains contains only code that
runs.

## Problem

Every client site rebuilds the same foundation: Next config, Tailwind tokens,
shadcn setup, a payment path, a contact form, SEO files, security headers. The
absi project got these right and they are worth keeping, but they are welded to
that conference's content. Copying absi means deleting a conference before you
can start.

## Success criteria

1. `git clone && npm install && npm run dev` shows a complete four-page marketing
   site with every module working against placeholder env values.
2. `npx tsx setup.ts` with Razorpay and Supabase deselected leaves a repo where
   `npm run check` passes and `grep -ri razorpay src/` returns nothing.
3. Recoloring a site is editing `src/styles/tokens.css` and nothing else.
4. No module's removal requires editing a file belonging to another module.

## Stack

Versions pinned as of 2026-09-12, checked against npm.

| Package | Version | Role |
|---|---|---|
| `next` | 16.3.5 | Framework |
| `react`, `react-dom` | 19.3.0 | Runtime |
| `typescript` | 7.0.2 | Native-port compiler, also used by `next build` |
| `@biomejs/biome` | 2.5.13 | Lint and format |
| `zod` | 4.6.2 | Every trust boundary |
| `tailwindcss`, `@tailwindcss/postcss` | 4.3.3 | Styling |
| `radix-ui` | 1.6.7 | shadcn primitives, single package |
| `lucide-react` | 1.45.0 | Icons |
| `motion` | 13.2.0 | Motion, scroll reveals |
| `next-themes` | 0.4.6 | Dark mode |
| `@supabase/supabase-js` | 2.116.0 | Database and auth |
| `@supabase/ssr` | 0.12.7 | Cookie-based sessions |
| `razorpay` | 2.9.8 | Payments |
| `resend` | 6.28.0 | Email, option A |
| `react-email`, `@react-email/components` | 6.9.5 | Email templates |
| `nodemailer` | 9.1.0 | Email, option B |
| `@playwright/test`, `@next/playwright` | latest | One instant-navigation test |

### Next.js 16.3 features used

- `cacheComponents: true` and `partialPrefetching: true` — Instant Navigations.
  Every route defines its loading shell inline with Suspense or `'use cache'`,
  never a `loading.tsx` file.
- `reactCompiler: true` with `experimental.turbopackRustReactCompiler: true` —
  no hand-written `useMemo` or `useCallback` anywhere in the template.
- `turbopackFileSystemCache` and `turbopackMemoryEviction` — default in 16.3,
  documented in the README rather than configured.
- `useTypeScriptCli` — `next build` type-checks with TypeScript 7.
- `catchError` from `next/error` — the root error boundary offers `retry()`,
  which refetches failed Server Components instead of only resetting client
  state, and does not swallow `notFound()` or `redirect()`.
- `next/root-params` — used by the optional i18n seam so `[lang]` never gets
  prop-drilled.
- `prefetchInlining` — default; the README records that it is why the network
  panel shows fewer prefetch requests.
- `instant()` from `@next/playwright` — one e2e test asserts the home-to-pricing
  navigation stays instant, so a later refactor that de-opts the route fails CI.

### React 19.3 features used

- `<ViewTransition>` wrapping the route shell, with `addTransitionType` marking
  forward and backward navigation so they animate differently.
- Trusted Types enabled alongside the CSP, closing DOM-based XSS sinks.
- Fragment Refs where a component needs to observe or focus its children and
  would otherwise render a wrapper `div` purely to hold a ref.
- Context rendered directly from Server Components, so the theme and toast
  providers need no `'use client'` wrapper component.

## Repository shape

```
setup.ts                      deleted by its own run
template.modules.json         the module manifest setup.ts reads
src/
  app/
    layout.tsx                fonts, providers, ViewTransition shell
    error.tsx                 catchError boundary with retry()
    not-found.tsx
    sitemap.ts robots.ts opengraph-image.tsx
    (marketing)/              home, about, pricing, contact     [core]
    (auth)/                   sign-in, sign-up, callback        [supabase]
    (dashboard)/              protected area                    [supabase]
    (checkout)/               checkout, confirmed               [razorpay]
    api/razorpay/webhook/     the one inbound POST              [razorpay]
  modules/
    registry.ts               one import line per module
    supabase/                 clients, auth actions, RLS schema
    razorpay/                 order action, verify, client widget
    email/                    resend.ts | smtp.ts | templates/
    forms/                    contact action, zod schemas
  components/
    ui/                       shadcn, untouched generated code
    site/                     nav, footer, section, hero primitives
  lib/
    env.ts                    zod-parsed environment, per-module blocks
    utils.ts seo.ts rate-limit.ts site-config.ts
  styles/
    globals.css               imports tokens.css, tailwind layers
    tokens.css                the only place design values exist
docs/
DESIGN.md PRODUCT.md          fill-in templates, absi's shape
.claude/commands/brand.md     PDF or brief -> DESIGN.md + PRODUCT.md + tokens.css
proxy.ts                      Supabase session refresh, security headers
```

A module owns exactly five things: its `src/modules/<name>/` folder, its
`src/app/(<name>)/` route group, one line in `modules/registry.ts`, one block in
`.env.example`, and one entry in `lib/env.ts`. No other file names it. That
constraint is what makes removal mechanical, and it is the rule to check when
adding anything to the template later.

## The setup script

`npx tsx setup.ts` is interactive and runs once.

1. Asks for project name, description, production URL.
2. Asks which modules to keep, from `template.modules.json`.
3. Asks which email transport to keep when the email module stays.
4. For each dropped module, reads its manifest entry and removes: its folders,
   its `registry.ts` line, its `.env.example` block, its `lib/env.ts` entry, its
   `package.json` dependencies, its nav entries in `lib/site-config.ts`.
5. Rewrites `package.json` name, `DESIGN.md` and `PRODUCT.md` titles, README.
6. Runs `npm install` then `npm run check`. A failure prints what broke and
   leaves the tree in place rather than reverting, so the seam that leaked is
   visible.
7. Deletes `setup.ts` and `template.modules.json`, then resets git history to a
   single initial commit.

`template.modules.json` is the single source of truth for what a module consists
of, so adding a module later means adding one manifest entry, not editing the
script.

## Security baseline

Never stripped by setup, regardless of which modules remain.

- Every file under `src/modules/*/server.ts` imports `server-only`.
- Mutations are Server Actions. API routes exist only where a third party must
  POST inward, which is the Razorpay webhook and the Supabase auth callback.
- Every action parses its input with a Zod schema as its first statement. The
  parsed value is what the rest of the function uses; the raw `FormData` is
  never read again.
- Razorpay: the order amount is computed server-side from a server-side price
  table and never read from the request. The webhook verifies its HMAC with
  `crypto.timingSafeEqual` before the body is parsed as JSON, and rejects with
  400 on mismatch. Payment confirmation is driven by the webhook, not the
  browser callback, because the browser can be closed mid-payment.
- Supabase: RLS enabled on every table in the example schema, with a policy per
  table written out in `modules/supabase/schema.sql`. The service-role key is
  read in exactly one file, `modules/supabase/admin.ts`, which is `server-only`
  and imported by nothing in the demo.
- `proxy.ts` refreshes the Supabase session cookie and sets CSP with a
  per-request nonce, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`,
  and `Referrer-Policy`. Trusted Types is enforced through the same CSP.
- `lib/rate-limit.ts` is an in-memory fixed-window limiter applied to the
  contact action and the order action. It carries a ponytail ceiling comment:
  single-instance only, move to Upstash or Supabase when the app runs on more
  than one node.
- `lib/env.ts` parses `process.env` with Zod at module load, so a missing secret
  fails the build rather than the first request.

## Design language

`src/styles/tokens.css` defines every color, type step, spacing rhythm, radius,
shadow and easing as a CSS custom property. Components reference tokens only. A
literal hex or px value in a component is a bug the quality gate should catch.

`DESIGN.md` and `PRODUCT.md` ship as templates in absi's structure: direction,
color table, type table, primitives, shadows, motion, layout for the first;
purpose, users, brand, tone, anti-references, strategic principles for the
second. Both open with a note that they are to be filled before any UI work.

`.claude/commands/brand.md` is a repo slash command that takes a client PDF or
brief, extracts palette and typography, and writes all three files in one pass.

The demo site is four real pages built only from tokens, so changing
`tokens.css` visibly changes the whole site. It is designed to be good enough to
show a client, which also means it is proof that every module works before a
line of project code is written.

## Quality checks

`npm run check` runs `tsc --noEmit`, `biome check`, and every `*.check.mts`
self-test. The self-tests use Node's native TypeScript stripping, no test
framework: one asserts that a tampered Razorpay webhook signature is rejected
and a correct one accepted, one asserts `lib/env.ts` rejects a missing required
variable. Playwright covers the single `instant()` navigation assertion.

## Out of scope

- Monorepo or workspace layout. One app, one package.json.
- A CMS. Content lives in `lib/site-config.ts` and MDX where a project needs it.
- i18n beyond leaving the `next/root-params` seam documented.
- A component gallery route. The demo site is the gallery.
- Stripe, analytics, or a blog module. Added when a project needs one, following
  the five-things rule above.
