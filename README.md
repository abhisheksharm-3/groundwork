# Groundwork

<!-- @module template -->
A Next.js 16.3 and React 19.3 starter for client sites. Clone it, run setup to keep
only the modules a project needs, hand `/brand` the client's brief, and start on
content rather than on foundations.

The demo site is Weft, a fictional textile gathering. It exists to prove every
module works and to show what a finished brief looks like; `/brand` replaces it.

## Start a project

```bash
git clone https://github.com/abhisheksharm-3/groundwork my-site
cd my-site
npm install
npm run setup
```

Setup asks for a project name and which modules to keep, removes the rest from
every file they touch, runs the full check, and replaces the history with a single
commit. Answers can be piped, one per line: `printf '%s\n' acme y n y resend acme | npm run setup`.

If a removed module is still referenced somewhere, setup stops, names the file and
line, and leaves the tree as it is so the seam can be fixed. Nothing is rolled back.

| Module | What it adds |
|---|---|
| `razorpay` | Passes bought through Razorpay Checkout, confirmed by webhook, with an emailed receipt |
| `supabase` | Email and Google sign-in, a protected dashboard, and contact messages stored with RLS |
| `email` | Mail through Resend or any SMTP server; without it, mail is logged |

The contact form is not a module. It always works: it mails when email is set up,
stores when Supabase is, and logs when neither is.
<!-- /@module template -->

## Run it

```bash
cp .env.example .env.local
npm run dev
```

Every module's secrets are optional. With them blank the site runs, and each module
says in visible copy that it is not switched on yet.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on Turbopack |
| `npm run build` | Production build, type-checked by TypeScript 7 |
| `npm run check` | Route types, `tsc`, Biome, and every `*.check.mts` self-test. The gate. |
| `npm run e2e` | Playwright on a production build, desktop and phone |

## Make it the client's

1. Run `/brand path/to/brief.pdf` in Claude Code. It rewrites `PRODUCT.md`,
   `DESIGN.md`, `src/styles/tokens.css`, `src/styles/fonts.ts` and
   `src/lib/site-config.ts`, and reports every fact it could not find in the brief.
2. Replace the photographs in `src/assets/images/`.
3. Edit the page copy under `src/app/(marketing)/`.

Recoloring alone is two numbers: `--hue-brand` and `--hue-action` in `tokens.css`.
Every brand, action and neutral color derives from them.

<!-- @module razorpay -->
## Razorpay

1. Dashboard, Account and Settings, API Keys: copy the key id and secret into
   `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
2. Settings, Webhooks, Add New Webhook: URL `https://<domain>/api/razorpay/webhook`,
   event `payment.captured`. Put the secret you choose into `RAZORPAY_WEBHOOK_SECRET`.
3. Settings, Payment capture: Automatic. A payment that is only authorised is never
   confirmed.

The site refuses to open an order until all three are set, because the webhook is
the only thing that confirms a payment. Prices come from `site-config.ts` through
`lib/pricing.ts` on the server; the checkout form sends a pass id and nothing about
money. Test and live keys differ only in value.
<!-- /@module razorpay -->

<!-- @module supabase -->
## Supabase

1. Project Settings, API: the project URL and the publishable key go into
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Both are
   safe in the browser; row level security protects the data.
2. Run `src/modules/supabase/schema.sql` in the SQL editor.
3. Authentication, URL Configuration: add `https://<domain>/auth/callback`.
4. For Google: Authentication, Providers, Google, with the client id and secret from
   Google Cloud.
<!-- /@module supabase -->

<!-- @module email -->
## Email

Set `RESEND_API_KEY`, or the four `SMTP_` variables. The first configured transport
wins. `EMAIL_FROM` defaults to the site name and contact address; with Resend its
domain must be verified.
<!-- /@module email -->

## Next.js 16.3 notes

- **Instant Navigations** are on: `cacheComponents` and `partialPrefetching`. A page
  shows its static shell at once and streams what reads the request, as the passes
  page does with today's price. Define shells inline with `Suspense`, not
  `loading.tsx`. `e2e/instant-navigation.spec.ts` fails when a refactor pulls
  content out of the shell.
- **Turbopack's file system cache** is on by default for dev and build, in
  `.next/cache`. Restore that directory in CI to get the faster builds.
  `turbopackMemoryEviction` defaults to `'auto'`.
- **Prefetch inlining** is on by default: small segments are bundled into one
  request (2,048 bytes per segment, 10,240 per bundle), which is why the network
  panel shows fewer prefetches than there are links.
- **The React Compiler** runs as the Rust port inside Turbopack. There is no Babel
  plugin, and no hand-written `useMemo` or `useCallback`.
- **Root params** (`next/root-params`) are the way to add a `[lang]` segment above the
  root layout. The template ships none. If a project needs one: the getters work in
  Server Components only, they throw in Server Actions and Route Handlers, and under
  `cacheComponents` every root parameter needs a `generateStaticParams` value or the
  build fails.

## Security notes

- The CSP is static, so pages stay prerendered. Scripts must allow `'unsafe-inline'`:
  the App Router's RSC payload and Suspense reveals are inline scripts, and under
  `script-src 'self'` the page does not hydrate. A per-request nonce would allow
  them, but it renders every page per request and removes the static shell.
- Trusted Types are required everywhere. Turbopack's chunk loader writes plain
  strings to `script.src`, so `TrustedTypesPolicy` defines a default policy that signs
  same-origin `/_next/` URLs and nothing else. HTML and script injection stay
  blocked.
<!-- @module razorpay -->
- Razorpay's `checkout.js` writes `innerHTML`, so `/checkout/*` alone runs without
  the Trusted Types requirement. Every other directive still applies there.
<!-- /@module razorpay -->
- Every Server Action parses its input with Zod before reading it, and is rate
  limited per address. The limiter is in memory, so the limit holds per instance.
