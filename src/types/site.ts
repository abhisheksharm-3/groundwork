/** The shapes of the project's facts in site-config.ts and of the page content built from them. */
import type { Route } from "next";
import type { StaticImageData } from "next/image";

/** A pass on sale. Prices are whole rupees; the order action converts to paise. */
export type PassType = {
  id: string;
  name: string;
  summary: string;
  includes: readonly string[];
  price: number;
  earlyPrice: number;
};

export type NavItemType = { href: Route; label: string };

/** A service that handles visitors' data on the site's behalf, named in the privacy policy. */
export type ProcessorType = { name: string; purpose: string; location: string };

/** Days before the first day of the event. Inside `halfUntilDays` nothing is refunded. */
export type RefundPolicyType = {
  fullUntilDays: number;
  halfUntilDays: number;
  processingDays: string;
};

export type SiteConfigType = {
  name: string;
  edition: string;
  tagline: string;
  description: string;
  locale: string;
  currency: string;
  timeZone: string;
  chrome: { ground: string; ink: string; accent: string; quiet: string };
  dates: { start: string; end: string; label: string };
  venue: { name: string; address: string; city: string };
  contact: { email: string; phone: string };
  /** The legal entity behind the site, as the payment gateway and the policies must name it. */
  organiser: { legalName: string; address: string; city: string };
  policiesUpdated: string;
  processors: readonly ProcessorType[];
  refunds: RefundPolicyType;
  legal: readonly NavItemType[];
  nav: readonly NavItemType[];
  passes: readonly PassType[];
  earlyUntil: string;
  /** Where a pass is bought; absent when the site sells no passes online. */
  checkout?: (passId: string) => Route<`/checkout/${string}`>;
  /** The signed-in area's nav entry; absent when the site has no accounts. */
  account?: NavItemType;
};

/** One of the three crafts on the home page. `layout` places the figure and text on the 12-column grid. */
export type CraftType = {
  floor: string;
  title: string;
  body: string;
  image: StaticImageData;
  alt: string;
  layout: string;
};

export type SessionType = { time: string; title: string; where: string };

export type ProgrammeDayType = {
  day: string;
  date: string;
  sessions: readonly SessionType[];
};
