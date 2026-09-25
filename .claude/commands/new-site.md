---
description: Turn a fresh groundwork clone and a client's PDF or brief into that client's working site
argument-hint: <path to the client PDF or brief>
---

Build this client's site from `$ARGUMENTS`, starting from a fresh clone of the
groundwork template. Work through the steps in order and stop at each checkpoint.

## 1. Read everything first

Read the whole source, every page, including the colophon and the back cover, where
dates, fees, the legal entity and the refund terms are often only printed there.
Then read `template.modules.json`, `src/lib/site-config.ts` and `PRODUCT.md`.

## 2. Choose the modules, then confirm

Decide from the source, and give one line of evidence for each:

- `razorpay`: the source names a fee, a ticket, a registration payment or a donation.
- `supabase`: attendees need to sign in, see what they bought, or the organisers want
  a list of sales or messages kept somewhere other than email.
- `email`: almost always. Resend when the client has no mail server of their own; SMTP
  when they already use Google Workspace, Zoho or similar.
- `monitoring`: whenever `razorpay` is kept.

**Checkpoint.** Present the choice, the evidence, and the project name, and wait for a
yes. Choosing modules deletes code; do not guess.

## 3. Run setup

Setup asks, one line each: the project name, then each top-level module in the order
`template.modules.json` lists it (`y` or `n`), then the email option if email is
kept, then the project name again to confirm. Pipe the answers:

```bash
printf '%s\n' <name> <y|n per module> [resend|smtp] <name> | npm run setup
```

If setup reports a leak, stop and fix the file it names; do not work around it.

## 4. Brand

Follow `.claude/commands/brand.md` in full: it rewrites `PRODUCT.md`, `DESIGN.md`,
`src/styles/tokens.css`, `src/styles/fonts.ts` and the facts in
`src/lib/site-config.ts`.

## 5. Content

- Rewrite the copy under `src/app/(marketing)/` from the source. Keep each page's
  structure and components; change words, sections and data arrays. Every fact comes
  from the source. What it does not state is written as "to be announced".
- `site-config.ts`: passes and prices, the early-rate cutoff, the organiser's legal
  name and address, and the refund windows.
- **Legal terms are the client's, never yours.** If the source gives no refund windows,
  legal entity or governing city, leave the demo values in place, list them in the
  report as needing the client's answer, and do not publish.
- Photographs: use the client's own. If there are none, source real photographs of the
  client's actual subject, the way the template's were chosen: Unsplash photo pages
  resolved to their `images.unsplash.com` URLs, downloaded into `src/assets/images/`,
  each one looked at before use. Never ship a colored block where a photograph belongs.
- Update the `alt` text of every image to describe the new photograph.

## 6. Verify

Run, in order, and fix anything that fails at its cause:

1. `npm run check`
2. `npm run build`
3. `npm run e2e`. The tests read their expectations from `site-config.ts`, so they
   should pass without edits; if one fails, the page is wrong, not the test.
4. `git status`, then commit with a message saying what the site is for.

## 7. Report

- The modules kept and why.
- Every fact marked "to be announced", and every legal term left at its demo value.
- The palette with its sources, the faces, and the contrast table from `/brand`.
- What needs the client before launch: keys for each kept module (see `README.md`),
  the Razorpay webhook, and sign-off on the policy pages.
