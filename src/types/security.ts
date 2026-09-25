/** Shapes used by the security headers and the rate limiter. */

/** Extra sources a module needs, keyed by CSP directive. */
export type CspSourcesType = Partial<Record<string, readonly string[]>>;

export type HeaderType = { key: string; value: string };

export type RateWindowType = { count: number; resetAt: number };

export type LimiterOptionsType = { limit: number; windowMs: number };

/** True while `key` is inside its allowance. `now` is injectable so the check file can control time. */
export type RateLimiterType = (key: string, now?: number) => boolean;
