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

## The five-things rule

A module owns its `src/modules/<name>/` folder, its `src/app/(<name>)/` route group,
one line in `registry.ts`, one block in `.env.example`, one entry in `lib/env.ts`.
Nothing else may name it. Adding a sixth touch point breaks `setup.ts` silently —
the strip succeeds and the build fails later. When adding to the template, check this
first.

## Gotchas

- Next 16.3 with `cacheComponents` and `partialPrefetching`: define loading shells
  inline with Suspense or `'use cache'`. Do not add `loading.tsx` files.
- React Compiler is on. Do not hand-write `useMemo`, `useCallback` or `memo`.
- `next dev` rewrites the `nextjs-agent-rules` block in `AGENTS.md`. Commit it with
  your work; deleting it from a diff only recreates the change.
- Read `node_modules/next/dist/docs/` before writing Next-specific code. This version
  post-dates most training data.
- A literal hex or px value in a component is a bug. Everything reads `tokens.css`.
- Razorpay: the amount is computed server-side and confirmation comes from the
  webhook, never the browser callback.
- `src/modules/supabase/admin.ts` holds the service-role key and is the only file
  allowed to read it.
