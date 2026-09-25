/**
 * The email module's one capability: send a mail through the first configured
 * transport. Each transport is a marked import and entry, so removing one
 * leaves the others working.
 */
import "server-only";
import { ENV } from "@/lib/env";
import { SITE } from "@/lib/site-config";
import type { MailType } from "@/types/capabilities";
/** @module email-resend */
import { resendTransport } from "./resend";
/** @module email-smtp */
import { smtpTransport } from "./smtp";

const TRANSPORT = [
  /** @module email-resend */
  resendTransport(),
  /** @module email-smtp */
  smtpTransport(),
].find((transport) => transport !== null);

const FROM = ENV.EMAIL_FROM ?? `${SITE.name} <${SITE.contact.email}>`;

/** False when no transport is configured; throws when the configured one fails. */
export async function sendMail(mail: MailType): Promise<boolean> {
  if (!TRANSPORT) return false;
  await TRANSPORT({ ...mail, from: FROM });
  return true;
}
