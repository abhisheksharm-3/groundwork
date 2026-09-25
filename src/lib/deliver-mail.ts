/**
 * Hands a mail to whichever transport the email module has configured. With no
 * email module, or one with no credentials set, the mail is logged instead, which
 * is what lets the demo run on placeholder values.
 */
import "server-only";
import { CAPABILITIES } from "@/modules/registry";
import type { MailType } from "@/types/capabilities";

/** True when a transport accepted the mail. Throws when a configured transport fails. */
export async function deliverMail(mail: MailType): Promise<boolean> {
  const isSent = (await CAPABILITIES.sendMail?.(mail)) ?? false;
  if (!isSent) {
    console.info(
      `[mail] no transport configured; not sent: "${mail.subject}" to ${maskAddress(mail.to)}`,
    );
  }
  return isSent;
}

/** Enough of an address to tell the site inbox from a customer's, without logging the customer. */
function maskAddress(address: string): string {
  const [local = "", domain = ""] = address.split("@");
  return `${local.slice(0, 1)}…@${domain}`;
}
