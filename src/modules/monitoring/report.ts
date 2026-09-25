/**
 * Sends a reported problem to Sentry. The SDK is initialised in
 * src/instrumentation.ts; before that, or with no DSN, capture is a no-op.
 */
import "server-only";
import * as Sentry from "@sentry/nextjs";

export function reportProblem(message: string, error?: unknown): void {
  if (error instanceof Error) {
    Sentry.captureException(error, { extra: { message } });
    return;
  }
  Sentry.captureMessage(message, { level: "error", extra: { detail: error } });
}
