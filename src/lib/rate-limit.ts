/**
 * Fixed-window rate limiting, keyed by whatever the caller chooses (usually the
 * client address). Each action creates its own limiter, so a burst of contact
 * messages never spends the order action's allowance.
 *
 * ponytail: the counters live in this process's memory, so the limit holds per
 * instance and resets on deploy. Move them to Upstash Redis or a database table
 * once the site runs on more than one instance.
 */
import type {
  LimiterOptionsType,
  RateLimiterType,
  RateWindowType,
} from "../types/security.ts";

/** Past this many tracked keys, expired windows are swept on the next call. */
const SWEEP_AT = 10_000;

/** Returns a check that is true while `key` is inside its allowance. */
export function createRateLimiter({
  limit,
  windowMs,
}: LimiterOptionsType): RateLimiterType {
  const windows = new Map<string, RateWindowType>();

  return (key, now = Date.now()) => {
    if (windows.size > SWEEP_AT) sweep(windows, now);
    const current = windows.get(key);
    if (!current || current.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    current.count += 1;
    return current.count <= limit;
  };
}

function sweep(windows: Map<string, RateWindowType>, now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}
