/** Sentry's project DSN, from Project Settings -> Client Keys. With it unset, problems are only logged. */
import { OPTIONAL_TEXT } from "@/lib/env-fields";

export const MONITORING_ENV = {
  SENTRY_DSN: OPTIONAL_TEXT,
};
