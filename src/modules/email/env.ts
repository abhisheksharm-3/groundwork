/**
 * The email module's settings. Each transport's own variables are marked, so
 * setup.ts keeps only the transport a project chose. With none set, mail is
 * logged instead of sent.
 */
import { OPTIONAL_TEXT } from "@/lib/env-fields";

export const EMAIL_ENV = {
  EMAIL_FROM: OPTIONAL_TEXT,
  /** @module email-resend */
  RESEND_API_KEY: OPTIONAL_TEXT,
  /** @module email-smtp */
  SMTP_HOST: OPTIONAL_TEXT,
  /** @module email-smtp */
  SMTP_PORT: OPTIONAL_TEXT,
  /** @module email-smtp */
  SMTP_USER: OPTIONAL_TEXT,
  /** @module email-smtp */
  SMTP_PASS: OPTIONAL_TEXT,
};
