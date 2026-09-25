/**
 * Starts Sentry on the server when SENTRY_DSN is set, and hands it every error
 * Next captures while rendering or handling a request. Server-side only: the
 * browser loads no Sentry code, so the CSP needs no new host.
 *
 * Reads process.env directly because instrumentation runs before the app, outside
 * the server runtime that `server-only` and src/lib/env.ts expect.
 */
import * as Sentry from "@sentry/nextjs";

export function register(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({ dsn, environment: process.env.NODE_ENV, tracesSampleRate: 0 });
}

export const onRequestError = Sentry.captureRequestError;
