/**
 * Resend over its HTTP API. One POST per mail, so it needs no SDK.
 * https://resend.com/docs/api-reference/emails/send-email
 */
import "server-only";
import { ENV } from "@/lib/env";
import type { TransportType } from "./types";

const ENDPOINT = "https://api.resend.com/emails";

/** Null when RESEND_API_KEY is unset, so the next transport, or the log, is used. */
export function resendTransport(): TransportType | null {
  const key = ENV.RESEND_API_KEY;
  if (!key) return null;

  return async (mail) => {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: mail.from,
        to: [mail.to],
        reply_to: mail.replyTo,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(
        `Resend refused the mail (${response.status}): ${detail}. Check RESEND_API_KEY and EMAIL_FROM.`,
      );
    }
  };
}
