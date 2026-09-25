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

## What this repo is

A starter template for client sites, not a product. Every file here gets copied into
real projects, so a shortcut taken once is a shortcut shipped many times. The spec is
`.polaris/specs/2026-09-12-client-site-template-spec.md`; read it before changing
structure.

`npx tsx setup.ts` strips the modules a given project does not need and then deletes
itself. Code that survives that strip must not reference code that does not.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server, Turbopack |
| `npm run build` | Production build, type-checked by TypeScript 7 |
| `npm run check` | `typecheck` + `lint` + every `*.check.mts` self-test. The gate. |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `biome check` |
| `npm run format` | `biome format --write` |
| `npm run e2e` | Playwright, including the `instant()` navigation assertion |
| `npx tsx setup.ts` | One-time project setup; strips unused modules, self-deletes |

## Architecture

| Path | Purpose |
|---|---|
| `src/app/(marketing)/` | The demo site: home, about, pricing, contact |
| `src/app/(auth)/`, `(dashboard)/` | Supabase module routes |
| `src/app/(checkout)/`, `api/razorpay/` | Razorpay module routes |
| `src/modules/<name>/` | All logic for one removable module |
| `src/modules/registry.ts` | One import line per module |
| `src/components/ui/` | Generated shadcn. Do not hand-edit. |
| `src/components/site/` | Nav, footer, section and hero primitives |
| `src/lib/env.ts` | Zod-parsed environment, one block per module |
| `src/styles/tokens.css` | The only place design values are defined |
| `template.modules.json` | What each module consists of; `setup.ts` reads it |

## The manifest rule

`template.modules.json` declares a module's whole footprint: its `src/modules/<name>/`
folder, its route paths (Razorpay has two, Supabase three), its `registry.ts` line, its
`.env.example` block, its `lib/env.ts` entry, its `package.json` deps, its
`site-config.ts` nav entries. A touch point the manifest does not list breaks `setup.ts`
silently — the strip succeeds and the build fails later. Adding to a module means
updating the manifest in the same commit. `npm run check` greps for this.

## Gotchas

- Next 16.3 with `cacheComponents` and `partialPrefetching`: define loading shells
  inline with Suspense or `'use cache'`. Do not add `loading.tsx` files.
- React Compiler is on. Do not hand-write `useMemo`, `useCallback` or `memo`.
- `next dev` writes the `nextjs-agent-rules` block at the end of this file. Commit it
  with your work; deleting it from a diff only recreates the change.
- Read `node_modules/next/dist/docs/` before writing Next-specific code. This version
  post-dates most training data.
- A literal hex or px value in a component is a bug. Everything reads `tokens.css`.
- Razorpay: the amount is computed server-side and confirmation comes from the
  webhook, never the browser callback.
- `src/modules/supabase/admin.ts` holds the service-role key and is the only file
  allowed to read it.
- CSP is static, built in `src/lib/security-headers.ts`. Scripts need `'unsafe-inline'`:
  the App Router's RSC payload and Suspense reveals are inline scripts, and
  `script-src 'self'` stops hydration (measured). Never add a per-request nonce: it
  forces every page dynamic and kills the static shell. A module adds CSP hosts
  through its own `csp.ts`, imported by `next.config.ts`.
- `proxy.ts` only refreshes the Supabase session. Return the `supabaseResponse`
  unmodified and use the `getAll`/`setAll` cookie adapter — the deprecated
  `get`/`set`/`remove` one breaks session refresh with no error.
- `error.tsx` is the plain file convention. It already gets `retry` and already
  ignores `notFound()`. Do not wrap it in `catchError`.
- Check files (`*.check.mts`) run under Node's type stripping, which does not resolve
  the `@/` alias. Import by relative path or they fail at run time.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
