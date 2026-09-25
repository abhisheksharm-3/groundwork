/**
 * The project's facts: name, dates, venue, contact, navigation and passes. The
 * header, footer, metadata and every page read from here, so a new client is
 * mostly an edit to this file and to tokens.css.
 *
 * Pure data with no `@/` imports, because the Razorpay price check imports it
 * under Node's type stripping, which does not resolve path aliases.
 *
 * A property preceded by an `@module <name>` doc comment belongs to that
 * module, and `setup.ts` deletes it when the module is dropped.
 */
import type { SiteConfigType } from "../types/site.ts";

export const SITE: SiteConfigType = {
  name: "Weft",
  edition: "2027",
  tagline: "Two days at the loom, the vat and the block.",
  description:
    "Weft is a two-day gathering of weavers, dyers and block printers at a converted mill in Ahmedabad, 20 and 21 February 2027. Watch the work, then do it.",
  locale: "en-IN",
  currency: "INR",
  timeZone: "Asia/Kolkata",
  /**
   * The brand in sRGB hex, for the two places CSS cannot reach: the browser's
   * theme-color and the generated share card, whose renderer reads neither CSS
   * variables nor OKLCH. Keep them equal to `brand-deep`, `on-brand`, `action` and
   * `on-brand-soft` in tokens.css; `/brand` rewrites both together.
   */
  chrome: {
    ground: "#142152",
    ink: "#f8f4eb",
    accent: "#f6c330",
    quiet: "#c2cadf",
  },
  dates: {
    start: "2027-02-20",
    end: "2027-02-21",
    label: "20–21 February 2027",
  },
  venue: {
    name: "The Calico Shed",
    address: "Naroda Road, Ahmedabad, Gujarat 380025",
    city: "Ahmedabad",
  },
  contact: { email: "hello@example.com", phone: "+91 79 0000 0000" },
  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "Programme" },
    { href: "/pricing", label: "Passes" },
    { href: "/contact", label: "Write to us" },
  ],
  passes: [
    {
      id: "day",
      name: "Day pass",
      summary: "One day, either day. Every talk, every open floor.",
      includes: [
        "Entry to all talks and demonstrations on your day",
        "The open dye floor and print tables",
        "Lunch from the mill canteen",
      ],
      price: 3500,
      earlyPrice: 2800,
    },
    {
      id: "full",
      name: "Both days",
      summary: "The whole gathering, with a seat at a hands-on session.",
      includes: [
        "Entry to everything on both days",
        "One three-hour hands-on session, booked on arrival",
        "Lunch both days and the Saturday supper",
      ],
      price: 6000,
      earlyPrice: 4800,
    },
    {
      id: "patron",
      name: "Patron",
      summary: "Both days, and the pass that pays a weaver's fee.",
      includes: [
        "Everything in the both-days pass",
        "A length of cloth woven at the gathering",
        "Your name on the loom-side roll of patrons",
      ],
      price: 15000,
      earlyPrice: 15000,
    },
  ],
  earlyUntil: "2026-12-31T23:59:59+05:30",
  /** @module razorpay */
  checkout: (passId) => `/checkout/${passId}`,
  /** @module supabase */
  account: { href: "/dashboard", label: "Your account" },
};
