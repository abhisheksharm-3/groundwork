# Client site template — design

A reusable Next.js starter that turns a client brief into a shipped site without
rebuilding the foundation each time. One `npx tsx setup.ts` run strips the modules
a given project does not need, so the repo that remains contains only code that
runs.

> The five questions this spec once left open were settled on 2026-09-12 and are
> recorded under [Decisions](#decisions). The one that changed the most code: a
> per-request CSP nonce and `cacheComponents` + `partialPrefetching` cannot both
> be true, because Next applies a nonce only during dynamic rendering and the
> static shell never gets one. This template keeps Instant Navigations and takes
> hash-based CSP through `experimental.sri`.

## Problem

Every client site rebuilds the same foundation: Next config, Tailwind tokens,
shadcn setup, a payment path, a contact form, SEO files, security headers. The
absi project got these right and they are worth keeping, but they are welded to
that conference's content. Copying absi means deleting a conference before you
can start.

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
| `react-email` | 6.9.5 | Email template dev server |
| `@react-email/components` | 1.0.12 | Email template components, versioned separately |
| `nodemailer` | 10.0.8 | Email, option B |
| `@playwright/test`, `@next/playwright` | 16.3.5 | One instant-navigation test |

### Next.js 16.3 features used

- `cacheComponents: true` and `partialPrefetching: true` — Instant Navigations.
  Every route defines its loading shell inline with Suspense or `'use cache'`,
  never a `loading.tsx` file.
- `reactCompiler: true` with `experimental.turbopackRustReactCompiler: true` —
  no hand-written `useMemo` or `useCallback` anywhere in the template.
- `turbopackFileSystemCache` and `turbopackMemoryEviction` — default in 16.3,
  documented in the README rather than configured.
- `useTypeScriptCli` — `next build` type-checks with TypeScript 7.
- `catchError` from `next/error` — used only for a nested boundary the template
  places around the module-backed sections of a page, so a failed Razorpay or
  Supabase read can be retried without reloading the route. `error.tsx` is left
  as the plain file convention: it already renders inside a Next-provided
  boundary, already receives `retry`, and already ignores `notFound()` and
  `redirect()`, so wrapping it in `catchError` would double-nest for nothing.
- `experimental.sri` with `algorithm: 'sha256'` — hash-based CSP. Chosen over a
  per-request nonce because nonces force every page dynamic and would make
  `cacheComponents`, `partialPrefetching` and the `instant()` test impossible.
- `prefetchInlining` — default; the README records that it is why the network
  panel shows fewer prefetch requests.
- `instant()` from `@next/playwright` — one e2e test asserts the home-to-pricing
  navigation stays instant, so a later refactor that de-opts the route fails CI.

### React 19.3 features used

- `<ViewTransition>` wrapping the route shell, with `addTransitionType` marking
  forward and backward navigation so they animate differently.
- Trusted Types enabled through the CSP's `require-trusted-types-for` directive,
  closing DOM-based XSS sinks. It is a separate directive from `script-src` and
  needs no nonce, so it survives the move to hash-based CSP.
- Fragment Refs where a component needs to observe or focus its children and
  would otherwise render a wrapper `div` purely to hold a ref.
- Context rendered directly from Server Components for the template's own
  providers, which therefore need no `'use client'` wrapper component.
  `next-themes` is the exception: it ships its own client provider and cannot be
  replaced by rendering a Context, so it stays as it is.

## Repository shape

```
setup.ts                      deleted by its own run
template.modules.json         the module manifest setup.ts reads
src/
  app/
    layout.tsx                fonts, providers, ViewTransition shell
    error.tsx                 the file convention's own retry()
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

### The manifest rule

A module's whole footprint is declared in `template.modules.json` and exists
nowhere else. In practice a module owns some of each of:

1. `src/modules/<name>/`, its own folder.
2. One or more route paths under `src/app/`. Razorpay owns `(checkout)/` and
   `api/razorpay/`; Supabase owns `(auth)/`, `(dashboard)/` and its callback
   route. One folder per module was the original wording and it was wrong.
3. One line in `src/modules/registry.ts`.
4. One block in `.env.example`.
5. One entry in `src/lib/env.ts`.
6. Its own dependencies in `package.json`.
7. Its nav entries in `src/lib/site-config.ts`.

Seven, not five. The number is not the point; the manifest being complete is.
Criterion G9 enforces it: a check file greps the tree for each module's name and
fails when a path turns up that the manifest does not list. Adding a touch point
the manifest does not know about is what breaks `setup.ts` silently, and G9 is
what turns that silence into a failing check.

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
- CSP is hash-based, set in `next.config.ts` alongside `experimental.sri`, not
  per-request. HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options` and
  `Referrer-Policy` are set there too, so the whole header set survives Supabase
  being stripped. Trusted Types is enforced through the same CSP via
  `require-trusted-types-for`.
- `proxy.ts` does one job: refreshing the Supabase session cookie. It returns the
  `supabaseResponse` object unmodified, as `@supabase/ssr` requires, and uses the
  `getAll`/`setAll` cookie adapter, never the deprecated `get`/`set`/`remove`
  one, which breaks session refresh silently. Dropping Supabase deletes the file
  outright and costs the project no headers.
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

## Acceptance criteria

Every criterion below is a command with an expected exit code or output, or a
file state a reader can observe without asking the author what was meant. A
criterion that needs a running server means `npm run build && npm run start` on
port 3000 unless it says `npm run dev`, because Next does not prefetch in dev and
several criteria depend on prefetching.

`CLONE` below means a working copy made by `git clone <template> app && cd app`.
`PLACEHOLDER ENV` means `cp .env.example .env.local` with no value edited.

Node's TypeScript stripping does not resolve the `@/` path alias, so every
`*.check.mts` file imports its subject by relative specifier (`./signature.ts`),
the way `src/lib/razorpay.check.mts` does in absi. A check file that imports `@/`
fails at run time, not at type-check time, which is why this is a criterion and
not a note.

### A. Fresh clone

A1. `npm install` in CLONE exits 0 and prints no peer-dependency error.
`node -p "require('next/package.json').version"` prints `16.3.5` and
`require('react/package.json').version` prints `19.3.0`.

A2. Every variable in `.env.example` has a non-empty placeholder value on the
right of the `=`. `grep -c '=$' .env.example` prints 0.

A3. With PLACEHOLDER ENV, `npm run dev` starts, `curl -sf -o /dev/null
localhost:3000` exits 0, and the terminal prints no error overlay line and no
unhandled rejection.

A4. With PLACEHOLDER ENV, `npm run build` exits 0. Its route table lists `/`,
`/about`, `/pricing` and `/contact`.

A5. With PLACEHOLDER ENV, `npm run check` exits 0 on the untouched clone, and its
output names each `*.check.mts` file it ran.

A6. Against `npm run start`, each of `/`, `/about`, `/pricing`, `/contact`
returns 200: `for p in "" about pricing contact; do curl -o /dev/null -s -w
"%{http_code}\n" localhost:3000/$p; done` prints `200` four times.

A7. With `.env.local` deleted and no environment set, `npm run build` exits
non-zero and the first error line names the missing variable and the file
`src/lib/env.ts`. No page is requested for this to happen.

A8. `npm run e2e` exits 0 against a production build.

A9. `npm run check` exits non-zero when a type error is introduced in
`src/app/(marketing)/about/page.tsx`, and the message is plain `tsc` output with
no Next code frame, which is the TypeScript 7 CLI checker's signature.

### B. Razorpay module

B1. `src/modules/razorpay/price.check.mts` asserts the amount in paise for every
plan id in the server price table, asserts an unknown plan id throws, and asserts
the plan ids `__proto__` and `constructor` are rejected. `npm run check` runs it.

B2. No amount is ever read from a request:
`grep -rnE 'get\("amount"\)|body\.amount|\.amount\b *=' src/modules/razorpay/ src/app` returns
nothing outside the price table and the response of Razorpay's own order API.

B3. `curl -s localhost:3000/checkout | grep -c 'name="amount"'` prints 0. The
checkout form posts a plan id, not a price.

B4. With `RAZORPAY_WEBHOOK_SECRET=test_secret` set, a POST to
`/api/razorpay/webhook` carrying `x-razorpay-signature: deadbeef` and the body
`{"event":"payment.captured"}` returns 400 and the response body is not the JSON
echoed back.

B5. The same body with a correct HMAC-SHA256 hex digest under `test_secret`
returns 200.

B6. In `src/app/api/razorpay/webhook/route.ts`, the line number of the signature
verification call is lower than the line number of `JSON.parse`. Reading the raw
body with `request.text()` is the only body read; `request.json()` does not
appear in the file.

B7. `src/modules/razorpay/signature.check.mts` rejects each of: an empty
signature, non-hex characters, an odd-length hex string, a truncated digest, a
digest with a trailing byte, 64 zeroes, a digest made under a different secret,
and any digest at all when the secret is the empty string. It accepts the exact
digest and the same digest upper-cased. It asserts that appending one space to
the body invalidates an otherwise correct digest.

B8. `grep -n "timingSafeEqual" src/modules/razorpay/signature.ts` prints one
line, and the file has no `import "server-only"`, because the check file imports
it directly. This is the one deliberate exemption from criterion F1.

B9. Only the webhook confirms a payment:
`grep -rln "confirmPayment" src/ | grep -v "^src/modules/razorpay/"` prints
exactly `src/app/api/razorpay/webhook/route.ts`.

B10. In the demo with test keys, paying an order sends the browser to
`/checkout/confirmed`, and the page states the payment reference. Killing the
browser tab between authorization and return still results in a confirmed
payment, because the webhook delivered it.

### C. Supabase module

C1. `/sign-in` and `/sign-up` return 200 against `npm run start` with placeholder
Supabase values.

C2. An unauthenticated GET of `/dashboard` returns a redirect to `/sign-in`:
`curl -o /dev/null -s -w "%{http_code} %{redirect_url}\n" localhost:3000/dashboard`
prints a 3xx status and a URL ending `/sign-in`.

C3. The cookie adapter uses the supported shape:
`grep -n "getAll\|setAll" src/modules/supabase/*.ts proxy.ts` prints at least one
hit in each, and `grep -rn "cookies: {" -A4 src/modules/supabase/ proxy.ts | grep
-E "^\s*(get|set|remove)\("` returns nothing. The deprecated `get`/`set`/`remove`
adapter silently breaks session refresh, which is why this is a grep and not a
review note.

C4. After sign-in, a second request carries a refreshed auth cookie: the response
to a request made with an expiring session includes a `Set-Cookie` for the
Supabase auth cookie, and the request that follows it reaches `/dashboard` with
200.

C5. `src/modules/supabase/schema.check.mts` parses `schema.sql` and asserts that
every `create table` has a matching `enable row level security` and at least one
`create policy` naming the same table. It fails when a table is added without
either.

C6. `grep -rln "SUPABASE_SERVICE_ROLE_KEY" src/ | grep -v "src/lib/env.ts"`
prints exactly `src/modules/supabase/admin.ts`.

C7. `grep -rn "supabase/admin" src/app/ src/components/ src/modules/ | grep -v
"src/modules/supabase/admin.ts"` returns nothing. Nothing in the demo imports the
admin client.

C8. `head -1 src/modules/supabase/admin.ts` is `import "server-only";`.

### D. Email module

D1. With no transport variable set, submitting `/contact` succeeds and the dev
server prints the rendered subject and the recipient to stdout. This is what
makes criterion A3 true without real credentials.

D2. With the resend transport chosen and `RESEND_API_KEY` set to an invalid
value, submitting `/contact` returns the form with the message
`We could not send your message. Email us at hello@example.com instead.` and the
server log names `RESEND_API_KEY`. The page does not show a stack trace.

D3. Exactly one transport file exists after setup: `ls src/modules/email/` lists
`resend.ts` or `smtp.ts`, never both.

D4. The vendor name appears in one file: with resend chosen,
`grep -rli "resend" src/ | grep -v "src/modules/email/resend.ts"` returns nothing
outside `src/lib/env.ts` and `.env.example`. With smtp chosen, the same holds for
`nodemailer`.

D5. `grep -rniE "resend|nodemailer|smtp" src/modules/email/templates/` returns
nothing. Templates render to HTML and know nothing about delivery.

D6. Every template renders without a network call: opening the react-email
preview shows each template with the site name and address taken from
`src/lib/site-config.ts`, and no placeholder `{{` remains in the output.

### E. Forms and content module

E1. With JavaScript disabled in the browser, submitting `/contact` with valid
values shows the success state. The Server Action is reachable as a plain form
POST.

E2. Submitting `/contact` with an empty email re-renders the form with
`Enter an email address we can reply to.` beside the email field, returns no
5xx, and produces no transport line in the log from criterion D1.

E3. Submitting `/contact` with a 20,000-character message returns the form with
`Keep the message under 2,000 characters.` and does not call the transport.

E4. The eleventh POST to the contact action from one address inside 60 seconds
returns `Too many messages from this address. Try again in a minute.` and the
transport is not called. The tenth succeeds.

E5. Every exported action parses first:
`grep -rn "formData.get" src/modules/` returns lines only inside the object
literal passed to a `safeParse` call, and no action reads `formData` after that
call.

E6. `src/lib/site-config.ts` drives the visible chrome: changing the `name` field
and reloading changes the header wordmark, the footer line, and the `<title>` of
all four pages. `git diff --name-only` after that change lists one file.

E7. `grep -rn "site-config" src/components/site/ src/app/layout.tsx` returns at
least one hit for the nav, the footer, and the layout metadata.

### F. Security baseline

One criterion per bullet in the security baseline section, in the same order.

F1. Every file in `src/modules/` that reads `process.env` or calls a vendor SDK
declares `import "server-only";` in its first three lines:
`for f in $(grep -rl "process.env\." src/modules/); do head -3 "$f" | grep -q
"server-only" || echo "$f"; done` prints nothing except
`src/modules/razorpay/signature.ts`, which is pure, takes its secret as an
argument, and is imported by a check file. That exemption is named in the file's
own comment.

F2. `find src/app -name "route.ts"` lists exactly two paths: the Razorpay webhook
and the Supabase auth callback. Every other mutation is a Server Action:
`grep -rln '"use server"' src/modules/` lists the contact action and the order
action.

F3. Criterion E5, applied to every action file, including the Razorpay order
action and the Supabase auth actions.

F4. Criteria B1, B2, B4, B6 and B9 together: server-side price, HMAC before
parse, 400 on mismatch, webhook-driven confirmation.

F5. Criteria C5, C6, C7 and C8 together: RLS on every example table, service-role
key in one `server-only` file that nothing in the demo imports.

F6. Against `npm run start`,
`curl -sI localhost:3000/ | grep -ciE "^(content-security-policy|strict-transport-security|x-frame-options|x-content-type-options|referrer-policy):"`
prints 5. `X-Frame-Options` is `DENY`. The CSP contains
`require-trusted-types-for 'script'` and no `'unsafe-inline'` in `script-src`.
Two consecutive `curl -sI` runs produce a byte-identical policy, per D5, and
every script tag in the document carries an `integrity` attribute.

F7. Criterion E4, plus its twin on the order action: the eleventh order attempt
from one address inside 60 seconds is refused before any Razorpay call.
`grep -n "ponytail:" src/lib/rate-limit.ts` prints a comment naming the
single-instance ceiling and Upstash or Supabase as the upgrade path.

F8. Criterion A7. A missing required variable stops the build, and the error
names both the variable and `src/lib/env.ts`.

### G. The setup script

Each row below is a run of `npx tsx setup.ts` on a fresh CLONE, with the answers
piped in on stdin so the matrix runs unattended. Every run is checked for three
things: the named greps return nothing, the named paths no longer exist, and
`npm run check` and `npm run build` both exit 0.

G1. All modules kept, resend chosen. `npm run check` exits 0. `setup.ts` and
`template.modules.json` no longer exist. `git log --oneline | wc -l` prints 1.
`node -p "require('./package.json').name"` prints the answer given at prompt 1.
`grep -rn "PROJECT_NAME\|{{" README.md DESIGN.md PRODUCT.md` returns nothing.

G2. Razorpay dropped. `grep -ril razorpay src/ proxy.ts .env.example
package.json` returns nothing. `src/modules/razorpay`, `src/app/(checkout)` and
`src/app/api/razorpay` do not exist. `curl -s localhost:3000 | grep -c "/checkout"`
prints 0. `npm run check` and `npm run build` exit 0.

G3. Supabase dropped. `grep -ril supabase src/ proxy.ts .env.example
package.json` returns nothing. `src/modules/supabase`, `src/app/(auth)` and
`src/app/(dashboard)` do not exist. `proxy.ts` still exists and criterion F6
still passes in full. `npm run check` and `npm run build` exit 0. This run is the
one that catches the shared-file leak, because `proxy.ts` is touched by both the
Supabase module and the security baseline.

G4. Email dropped. `grep -rilE "resend|nodemailer" src/ package.json` returns
nothing. `/contact` still returns 200, still rejects an empty email with the copy
from E2, and its success copy is `Thanks. We have your message.` per D4. The
submission still reaches the server log, and Supabase when that module is
present.
`npm run check` and `npm run build` exit 0.

G5. Razorpay and Supabase both dropped. `grep -ri razorpay src/` returns nothing
and `grep -ri supabase src/` returns nothing. `npm run check` exits 0. This is
the original success criterion 2, kept verbatim as a criterion.

G6. Every module dropped. Only `src/app/(marketing)` and the core files remain,
`npm run check` and `npm run build` exit 0, and all four pages return 200.

G7. Resend chosen. `src/modules/email/smtp.ts` does not exist and
`grep -n nodemailer package.json` returns nothing. Smtp chosen: the mirror, with
`resend` absent from `package.json`.

G8. `src/lib/env.check.mts` asserts that every variable named in `.env.example`
appears in `src/lib/env.ts` and that every variable read in `src/lib/env.ts`
appears in `.env.example`. It runs in `npm run check`, so an orphan block left by
a strip fails the gate rather than the first deploy.

G9. The manifest covers every path each module touches: for each module name,
`grep -ril <name> src/ proxy.ts .env.example package.json` produces no path that
is absent from that module's entry in `template.modules.json`. Wire this as a
`*.check.mts` so adding a sixth touch point fails the gate the day it is added,
not on the strip run months later.

G10. A leak is reported, not reverted. Add an import of
`src/modules/razorpay/price.ts` to `src/components/site/nav.tsx`, then run setup
dropping Razorpay. The script exits non-zero, its output names `nav.tsx`, and
`src/app/(marketing)` and `src/components/` are still on disk. Nothing was rolled
back.

G11. `npm install` runs inside setup and the lockfile matches the trimmed
`package.json` afterwards: `npm ci` on the result exits 0.

### H. Design language

H1. No literal design values in components:
`grep -rnE "#[0-9a-fA-F]{3,8}\b|\b[0-9]+px\b|rgb\(|hsl\(" src/components/ src/app/ --include="*.tsx"`
returns nothing.

H2. Tokens live in one file:
`grep -rln -- "--color-\|--radius-\|--shadow-\|--ease-\|--text-" src/` prints only
`src/styles/tokens.css`.

H3. Recoloring is one file. Change the brand hue in `src/styles/tokens.css` and
reload: the nav, the hero button, the footer band and the focus ring all change.
`git diff --name-only` lists `src/styles/tokens.css` and nothing else.

H4. `DESIGN.md` opens with a line stating it must be filled before any UI work,
and its `##` headings are exactly: direction, color, type, primitives, shadows,
motion, layout. `PRODUCT.md` opens with the same line and its `##` headings are
exactly: purpose, users, brand, tone, anti-references, strategic principles.

H5. `.claude/commands/brand.md` exists. Running `/brand` on a client PDF rewrites
`DESIGN.md`, `PRODUCT.md` and `src/styles/tokens.css`, and `git status
--porcelain` afterwards lists exactly those three paths.

### I. Next.js 16.3 features

One criterion per feature named in the stack section, in the same order.

I1. `next.config.ts` sets `cacheComponents: true` and `partialPrefetching: true`.
`npm run build` exiting 0 is itself the proof of the pair, because
`partialPrefetching` without `cacheComponents` throws at config validation.
`find src/app -name "loading.tsx"` returns nothing.
`grep -rln "Suspense\|'use cache'" "src/app/(marketing)"` lists every page file
under that group.

I2. `next.config.ts` sets `reactCompiler: true` and
`experimental.turbopackRustReactCompiler: true`.
`grep -rnE "\buseMemo\(|\buseCallback\(|\bmemo\(" src/` returns nothing. After
`npm run build`, `grep -rl "react/compiler-runtime" .next/static/chunks | head -1`
prints a path, which is the compiler's own runtime import and only appears when
the compiler actually ran.

I3. `grep -nE "turbopackFileSystemCache|turbopackMemoryEviction" next.config.ts`
returns nothing, and `README.md` records that
`experimental.turbopackFileSystemCacheForDev` and
`turbopackFileSystemCacheForBuild` are both on by default in 16.3, that the build
cache lives in `.next/cache` and needs restoring in CI to help, and that
`turbopackMemoryEviction` defaults to `'auto'`.

I4. Criterion A9 proves the TypeScript 7 CLI checker ran.
`grep -n "useTypeScriptCli" next.config.ts` returns nothing, because it is on by
default and setting it to `false` would break the build under TypeScript 7.

I5. `src/app/error.tsx` is a `'use client'` module whose component receives
`{ error, retry }` and calls `retry()` from its button. Throwing from a Server
Component under `/pricing` renders the boundary; clicking the button re-runs the
Server Component and the page recovers without a full reload. Calling
`notFound()` inside the same subtree renders `not-found.tsx`, not the error page.
Per D2, `error.tsx` itself is the plain file convention and is not wrapped:
`grep -n "catchError" src/app/error.tsx` returns nothing.

I6. Per D3: `grep -rn "next/root-params" src/` returns
nothing, no `[lang]` segment exists, and `README.md` records the seam with its
three constraints, that the getters work in Server Components only, that they
throw in Server Actions and Route Handlers, and that under `cacheComponents`
every root parameter needs a `generateStaticParams` value or the build fails.

I7. `grep -n "prefetchInlining" next.config.ts` returns nothing, and `README.md`
records that inlining is on by default from 16.3 with a 2,048-byte per-segment
and 10,240-byte per-bundle threshold, which is why the network panel shows fewer
prefetch requests than there are links.

I8. `npm run e2e` runs against `next build && next start`, not `next dev`. One
test calls `instant(page, ...)` from `@next/playwright` and asserts the pricing
heading is visible inside the instant scope. Removing the Suspense boundary from
`/pricing` and re-running makes that test fail. Record the failing run once, so
the guard is known to guard something.

### J. React 19.3 features

J1. `src/app/layout.tsx` renders `<ViewTransition>` around the route shell. The
nav calls `addTransitionType('forward')` inside `startTransition` for a link
click and `addTransitionType('backward')` for the back control.
`src/styles/tokens.css` defines animations under
`:active-view-transition-type(forward)` and `:active-view-transition-type(backward)`.
In a Chromium browser, navigating home to pricing animates one direction and
going back animates the other.

J2. The CSP from F6 contains `require-trusted-types-for 'script'` and a
`trusted-types` directive naming the policies the app creates. Loading all four
pages in the production build logs no `TrustedHTML` violation in the console.
`grep -rn "dangerouslySetInnerHTML" src/` returns nothing outside a file that
creates a Trusted Types policy for it. The `next-themes` inline script is the
known risk and must be covered by that policy or by an SRI hash.

J3. At least one component passes a ref to `<Fragment>` and calls a
`FragmentInstance` method on it. The scroll-reveal primitive uses
`observeUsing(new IntersectionObserver(...))` on that ref, and inspecting a
revealed section in DevTools shows no wrapper element around its children.
`grep -rn "<div ref=" src/components/site/` returns nothing.

J4. `src/app/layout.tsx` has no `'use client'` directive and renders a Context
from a `'use client'` module directly, as `<SiteContext value={...}>` with no
wrapper provider component. `grep -rn "Provider" src/app/layout.tsx` returns
nothing for template-owned contexts. `next-themes` is exempt: it ships its own
client provider component and cannot be replaced by this pattern. Name that
exemption in a comment so the next reader does not try.

## Build order

Ten slices. Each one ends green on `npm run check` and on the criteria named
after it, and depends only on slices above it.

1. Skeleton and gate. `package.json`, `tsconfig.json`, `biome.json`,
   `next.config.ts`, `postcss.config.mjs`, empty `tokens.css` and `globals.css`,
   a root layout and a home page with one heading. Proves A1, A4, A5, A9.
2. Design language. Fill `tokens.css`, build `components/site/` nav, footer,
   section and hero, then the four marketing pages on tokens alone. Ship
   `DESIGN.md`, `PRODUCT.md` and `.claude/commands/brand.md`. Proves A6, H1–H5.
3. Framework wiring. ViewTransition shell with `addTransitionType`,
   `error.tsx` with `retry`, `not-found.tsx`, `sitemap.ts`, `robots.ts`,
   `opengraph-image.tsx`, inline Suspense shells, the Fragment Refs reveal, the
   Context-from-a-Server-Component wiring, and the README notes for the
   default-on flags. Proves I1–I7, J1, J3, J4.
4. Security spine. `lib/env.ts` with a Zod parse at module load,
   `lib/env.check.mts`, `lib/rate-limit.ts` with its ceiling comment, and
   the five headers plus the Trusted Types directive and `experimental.sri` in
   `next.config.ts`, per D5. Proves A2, A7, F6, F8, J2, G8.
5. Forms and content. `lib/site-config.ts`, the contact schema, the contact
   action with a Zod parse first and the rate limiter applied, and the empty,
   invalid, over-length, rate-limited and success states of `/contact`. Proves
   E1–E7, F3, F7.
6. Email. `resend.ts` and `smtp.ts` behind one interface, the templates, the
   stdout fallback that makes the demo work with placeholder values, and the
   contact action wired to it. Proves D1–D6.
7. Razorpay. The server price table with its check file, `signature.ts` with
   its check file, the order action, the checkout page and client widget, the
   webhook route, and the confirmed page. Proves B1–B10, F2, F4.
8. Supabase. Browser, server and admin clients, the auth routes and actions,
   the dashboard guard, `schema.sql` with its check file, and the session refresh
   folded into the `proxy.ts` written in slice 4. Proves C1–C8, F1, F5.
9. Manifest and setup. `template.modules.json`, `modules/registry.ts`,
   `setup.ts`, and the manifest-coverage check. Run the full strip matrix. Proves
   G1–G11, G9 in particular, which cannot be written before every module exists.
10. Instant navigation guard and README. Playwright config, the `instant()`
    test recorded failing once before it passes, and the gotcha list. Proves A8,
    I8.

Slices 5 through 8 are independent of each other and can be reordered or run in
parallel. Slice 9 depends on all of them. Slice 10 depends on slice 3.

## Decisions

The five forks this spec left open, settled 2026-09-12. Each records what was
chosen and what it rules out, so a later reader does not reopen a closed
question.

**D1. Per-module secrets are optional; core variables are required.**
`NEXT_PUBLIC_SITE_URL` and the site name are required and a missing one fails the
build. Vendor secrets are optional, and the module's entry point refuses to act
and says so in visible copy, the way absi's `razorpay.ts` returns `null` and the
registration page says online payment is not switched on yet. The one hard
exception: the order action refuses to create an order when
`RAZORPAY_WEBHOOK_SECRET` is missing, because a site that takes money it cannot
confirm is worse than a site that cannot take money. Requiring everything would
mean every client's first deploy fails before any content exists.

**D2. `error.tsx` uses the file convention; `catchError` is used once, nested.**
The 16.3 reference is explicit that `error.js` already renders inside a built-in
boundary, already receives `retry`, and does not need wrapping. `catchError`
wraps the checkout widget instead, where a component-level boundary is the whole
point. Wrapping `error.tsx` would nest two boundaries and risk catching
`notFound()`.

**D3. No `[lang]` segment ships. The seam is a README note.**
`next/root-params` comes out of the features-used list, because it contradicted
"Out of scope". The README records the seam and its three constraints: every root
parameter needs a `generateStaticParams` value under `cacheComponents` or the
build fails, the getters throw in Server Actions and Route Handlers, and adding
the segment changes every route path in the template.

**D4. Forms survives the email module being dropped, and stores.**
The contact action writes to Supabase when that module is present and always logs
server-side. Email is a bolt-on the action checks for, never a dependency. A
template where dropping email silently deletes a page is surprising, and one
where the form returns success while discarding the message is worse.

**D5. Hash-based CSP through `experimental.sri`. No nonce.**
Next applies a nonce only during server-side rendering from the request's CSP
header, and the 16.3 CSP guide states outright that partial prerendering is
incompatible with a nonce-based CSP because static shell scripts never see the
nonce. Keeping the nonce would have meant deleting `partialPrefetching`, the
`instant()` test and the whole Instant Navigations section, and server-rendering
every page on every request. Instead `experimental.sri` with `sha256` puts
build-time integrity hashes on script tags, the CSP is static and carries no
`unsafe-inline` for scripts, and `require-trusted-types-for` is unaffected. The
cost accepted: `experimental.sri` is experimental and App Router only.

## Out of scope

- Monorepo or workspace layout. One app, one package.json.
- A CMS. Content lives in `lib/site-config.ts` and MDX where a project needs it.
- i18n beyond leaving the `next/root-params` seam documented.
- A component gallery route. The demo site is the gallery.
- Stripe, analytics, or a blog module. Added when a project needs one, following
  the five-things rule above.
