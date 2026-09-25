/** Display formatting for money and dates, in the site's locale and the event's time zone. */
import { SITE } from "./site-config.ts";

const RUPEES = new Intl.NumberFormat(SITE.locale, {
  style: "currency",
  currency: SITE.currency,
  maximumFractionDigits: 0,
});

const DAY_MONTH = new Intl.DateTimeFormat(SITE.locale, {
  day: "numeric",
  month: "long",
  timeZone: SITE.timeZone,
});

export function formatPrice(amount: number): string {
  return RUPEES.format(amount);
}

export function formatDayMonth(iso: string): string {
  return DAY_MONTH.format(new Date(iso));
}
