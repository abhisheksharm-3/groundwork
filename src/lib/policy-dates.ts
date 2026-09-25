/** Dates the policies quote, derived from the event's first day so a new edition updates them all at once. */
import { formatDayMonth } from "./format.ts";
import { SITE } from "./site-config.ts";

const DAY_MS = 86_400_000;

/** The last day a refund at the given number of days' notice can be asked for, as "7 February". */
export function refundDeadline(daysBefore: number): string {
  return formatDayMonth(
    new Date(
      Date.parse(`${SITE.dates.start}T00:00:00+05:30`) - daysBefore * DAY_MS,
    ).toISOString(),
  );
}
