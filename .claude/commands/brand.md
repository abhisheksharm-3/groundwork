---
description: Turn a client's PDF or brief into this project's brand, facts and design tokens
argument-hint: <path to the client PDF or brief>
---

Rebrand this template for a new client from `$ARGUMENTS`.

Read the whole source first. For a PDF, read every page, including the colophon and
the back cover: dates, venues and fees are often only printed there.

## What you write

Exactly these five files, and nothing else:

1. `PRODUCT.md`: keep the headings as they are (register, purpose, users, brand,
   tone, anti-references, strategic principles, accessibility). Replace the opening
   note with one line naming the client and the source document.
2. `DESIGN.md`: keep the headings (direction, color, type, primitives, shadows,
   motion, layout). Explain the new system; never restate a number that lives in
   `tokens.css`.
3. `src/styles/tokens.css`: set the three hue knobs, then adjust lightness and
   chroma per role. Keep every role name. Components read roles, so a new brand
   must never add a color-named token.
4. `src/styles/fonts.ts`: the two faces, exposed as `--face-display` and
   `--face-body`. Keep those variable names.
5. `src/lib/site-config.ts`: the client's facts: name, edition, tagline, dates,
   venue, contact, passes and prices. Keep every property marked `@module`.

## How to decide

- Use the `impeccable` skill for the design decisions. Run its font selection
  procedure and its category-reflex check; a brand color or face sampled from the
  client's own material overrides both, because identity-preservation wins.
- Sample brand colors from the source and convert them to OKLCH. Record where each
  came from in `DESIGN.md`.
- Every fact comes from the source. Anything the source does not state is written
  as "to be announced" in the copy, never invented.
- Check contrast: every text and background pair must reach 4.5:1. Report the
  pairs you checked and their ratios.

## Before you finish

1. Run `npm run check` and `npm run build`. Both must pass.
2. Run `git status --porcelain` and confirm only the five files above changed. If a
   component needed an edit to take the new brand, that is a missing token: add
   the token, and say so in your report.
3. Report: the palette with sources, the two faces and why, every fact marked to
   be announced, and the contrast table.
