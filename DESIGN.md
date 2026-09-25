# Weft 2027 design system

> Replace this file before any UI work on a real project. It documents the demo
> site's system so the next designer can see how the parts fit; `/brand` rewrites
> it from a client brief. The values themselves live only in
> `src/styles/tokens.css`. This file explains them and never restates a number
> that could drift from that file.

## Direction

Cloth come out of an indigo vat. The site alternates drenched indigo bands with
unbleached-cotton grounds, the way a length of shibori alternates dyed and resist
areas, and every drenched band closes on a woven selvedge in turmeric.

The scene the theme was chosen from: someone in Bengaluru on their phone after
dinner, under a warm lamp, deciding whether a pass and a train are worth it. That
is a light theme on a warm ground, with the brand carrying real weight rather
than sitting in a 10% accent.

## Color

Committed strategy: indigo carries 30 to 60% of the surface, turmeric is the one
action color, and neutrals are tinted toward the brand hue.

Every color is OKLCH and derives from three hue knobs on `:root`:

| Knob | Drives |
|---|---|
| `--hue-brand` | Every brand shade, the ink, the lines, the neutral tint |
| `--hue-action` | The call-to-action fill and its pressed shadow |
| `--hue-signal` | Errors and the destructive shadcn role |

Components read roles, never color names:

| Role | Use |
|---|---|
| `brand-deepest` | Footer ground, the page's underlay |
| `brand-deep` | Drenched bands (`on-brand` utility) |
| `brand` | Primary buttons, links on light grounds |
| `brand-tint` | The price stub on a pass |
| `action` | The one call to action per screen, the selvedge |
| `ground`, `ground-alt`, `surface` | Page, alternating band, raised surface |
| `ink`, `ink-soft` | Body text, secondary text |
| `on-brand`, `on-brand-soft` | Text on a drenched band |

The shadcn roles (`primary`, `muted`, `destructive` and the rest) are aliases of
these, so generated components pick up the brand with no edits.

## Type

| Role | Face | Setting |
|---|---|---|
| Display | Rozha One | Headings and the wordmark. One weight; hierarchy comes from size. |
| Body | Anek Latin | Running text at width 96, 1.0625rem, line-height 1.65. |
| Label | Anek Latin | The `label` utility: width 78, 600, tracked caps. Eyebrows, nav, buttons. |

The scale is fluid from `text-xl` up and steps by more than 1.25 at every size.
`text-display` is reserved for the wordmark in the home hero.

## Primitives

All in `src/styles/globals.css`, all reading tokens:

- `on-brand`: a drenched band. Flips the ground, the text and the focus ring.
- `selvedge`: the signature. Two rows of picks offset by one, colored from
  `currentColor`, closing every drenched band.
- `page`: the content column with the fluid gutter.
- `label`: tracked condensed caps.

The React primitives in `src/components/site/` are `PageMast`, `ActionLink`,
`Reveal`, `PageTransition`, `SiteHeader` and `SiteFooter`.

## Shadows

Two, both tinted with the brand hue, never black. `shadow-lift` raises a surface
off the ground; `shadow-press` is the flat turmeric edge under an action button,
which disappears when it is pressed, like a stamp.

## Motion

- Page load: the hero staggers in, one `--stagger` step per line.
- Scroll: `Reveal` fades and lifts each child once, staggering children that
  arrive together. Content already on screen at load is never hidden.
- Navigation: a view transition slides forward or back by the link's position in
  the nav.
- Everything uses exponential ease-out. `prefers-reduced-motion` removes all of it.

## Layout

A 12-column grid inside a `--container-page` column. Sections breathe on
`--spacing-section`, which scales with the viewport. Compositions are asymmetric:
image and text never split a row evenly, and alternate sides down the page.
Bands alternate drenched, ground and ground-alt, so no two neighbours share a
ground.
