# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Behavioral Rules

These rules apply to every task unless explicitly overridden.
Bias: caution over speed on non-trivial work.

### Rule 1 — Think Before Coding
State assumptions explicitly. Ask rather than guess.
If multiple interpretations exist, present them — don't pick silently.
Push back when a simpler approach exists. Stop when confused.

### Rule 2 — Simplicity First
Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
No "flexibility" or "configurability" that wasn't requested.
If you write 200 lines and it could be 50, rewrite it.

### Rule 3 — Surgical Changes
Touch only what you must. Don't improve adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.
Remove imports/variables/functions that YOUR changes made unused.
Don't remove pre-existing dead code unless asked.

### Rule 4 — Goal-Driven Execution
Define success criteria. Loop until verified.
For multi-step tasks, state a brief plan with numbered steps before touching code.
Strong success criteria let Claude loop independently.

### Rule 5 — Use the Model Only for Judgment Calls
Use for: classification, drafting, summarization, extraction.
Do NOT use for: routing, retries, deterministic transforms.
If code can answer, code answers.

### Rule 6 — Token Budgets Are Not Advisory
If a session is spiraling or re-suggesting rejected fixes, summarize and start fresh.
Surface the breach. Do not silently overrun.

### Rule 7 — Surface Conflicts, Don't Average Them
If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup. Don't blend conflicting patterns.

### Rule 8 — Read Before You Write
Before adding code, read exports, immediate callers, shared utilities.
If unsure why existing code is structured a certain way, ask.

### Rule 9 — Tests Verify Intent, Not Just Behavior
Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

### Rule 10 — Checkpoint After Every Significant Step
Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back. If you lose track, stop and restate.

### Rule 11 — Match the Codebase's Conventions, Even if You Disagree
Conformance > taste inside the codebase.
If you think a convention is harmful, surface it. Don't fork it silently.

### Rule 12 — Fail Loud
"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.

---

<!-- @module template -->
## What this repo is

The groundwork template for client sites, not a product. Every file here is copied
into real projects, so a shortcut taken once is a shortcut shipped many times. The
spec is `.polaris/specs/2026-09-12-client-site-template-spec.md`; read it before
changing structure.

`npm run setup` asks which optional modules a project keeps, removes the rest from
every file they touch, checks the result and starts a fresh git history.
`/new-site <brief>` runs setup, `/brand` and the content pass from a client's PDF. Code that
survives a strip must not reference code that does not.

## The manifest rule

`template.modules.json` lists each module's paths, dependencies, scripts and
keywords. A module's lines in shared files sit under a marker: `/** @module name */`
above one statement in code, `# @module name` above a block in `.env.example`,
`<!-- @module name -->` around a section in markdown. `scripts/modules.check.mts`
fails the gate when any keyword appears outside the module's paths and marked
blocks, so a new touch point has to be marked the day it is added.
<!-- /@module template -->

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Dev server, Turbopack |
| `npm run build` | Production build, type-checked by TypeScript 7 |
| `npm run check` | Route types, `tsc`, Biome, and every `*.check.mts`. The gate. |
| `npm run format` | `biome format --write` |
| `npm run e2e` | Playwright against a production build, including the `instant()` guard |
| `/brand <brief>` | Rewrites the brand docs, tokens, fonts and site facts from a client brief |

## Architecture

| Path | Purpose |
|---|---|
| `src/app/(marketing)/` | Home, programme, passes, contact |
| `src/features/` | Always-present features (contact) |
| `src/modules/` | Optional modules; `registry.ts` is where they plug into the core |
| `src/components/ui/` | Generated shadcn. Do not hand-edit. |
| `src/components/site/` | Header, footer, page mast, form field, reveal, transitions |
| `src/lib/` | Env, pricing, rate limit, security headers, site config |
| `src/types/` | Types shared by more than one feature |
| `src/styles/tokens.css` | The only place design values are defined |

## One kind of thing per file

Types live only in types files: `src/features/<name>/types.ts`,
`src/modules/<name>/types.ts`, or `src/types/` when more than one feature uses them.
A schema file holds schemas, an action file holds actions, a component file holds
components, a page holds a page. No `type` declaration anywhere else, including a
component's own props type.

## Gotchas

- Next 16.3 with `cacheComponents` and `partialPrefetching`: define loading shells
  inline with Suspense or `'use cache'`. Do not add `loading.tsx` files.
- React Compiler is on. Do not hand-write `useMemo`, `useCallback` or `memo`.
- `next dev` writes the `nextjs-agent-rules` block at the end of this file. Commit it
  with your work; deleting it from a diff only recreates the change.
- Read `node_modules/next/dist/docs/` before writing Next-specific code. This version
  post-dates most training data.
- A literal hex or px value in a component is a bug. Everything reads `tokens.css`.
  The only literals are the sRGB `chrome` colors in `site-config.ts`, for the places
  CSS cannot reach: theme-color, the share card, email.
- `typedRoutes` is on. A computed href needs `Route<'/path/${string}'>`, and a plain
  `Route` excludes dynamic routes.
- CSP is static, built in `src/lib/security-headers.ts`. Scripts need `'unsafe-inline'`:
  the App Router's RSC payload and Suspense reveals are inline scripts, and
  `script-src 'self'` stops hydration (measured). Never add a per-request nonce: it
  forces every page dynamic and kills the static shell. A module adds CSP hosts
  through its own `csp.ts`, imported by `next.config.ts`.
- `error.tsx` is the plain file convention. It already gets `retry` and already
  ignores `notFound()`. Do not wrap it in `catchError`.
- A module that is installed but unconfigured answers `false` from its capability,
  never throws, so a fresh clone runs on placeholder values.
- Check files (`*.check.mts`) run under Node's type stripping, which does not resolve
  the `@/` alias. Import by relative path or they fail at run time.
<!-- @module razorpay -->
- Razorpay: the amount comes from `lib/pricing.ts` on the server and confirmation
  comes from the webhook, never the browser return. `checkout.js` writes innerHTML,
  so `/checkout/*` runs without the Trusted Types requirement; nothing else does.
<!-- /@module razorpay -->
<!-- @module supabase -->
- `src/proxy.ts` only refreshes the Supabase session and guards `/dashboard`. Keep
  `getClaims` straight after creating the client, and return the response `setAll`
  last built; an earlier one does not carry the refreshed cookies.
- Every table in `src/modules/supabase/schema.sql` needs RLS and a policy; the check
  fails the gate otherwise.
<!-- /@module supabase -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
