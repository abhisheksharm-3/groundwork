/**
 * Razorpay's payment webhook: the only thing that confirms a sale. The signature
 * is verified against the raw body before anything parses it, because a parsed
 * and re-serialised body no longer matches what Razorpay signed.
 *
 * Dashboard: Settings -> Webhooks -> Add New Webhook, URL /api/razorpay/webhook,
 * event payment.captured, secret into RAZORPAY_WEBHOOK_SECRET.
 */

import { reportProblem } from "@/lib/report-problem";
import { verifyWebhookSignature } from "@/modules/razorpay/client";
import { confirmPayment } from "@/modules/razorpay/confirm";
import {
  CAPTURED_EVENT,
  RETRYABLE_REASONS,
} from "@/modules/razorpay/constants";
import { WebhookEventSchema } from "@/modules/razorpay/schemas";

/** Seconds. A literal, because route segment config must be statically analysable. */
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const raw = await request.text();
  if (
    !verifyWebhookSignature(
      raw,
      request.headers.get("x-razorpay-signature") ?? "",
    )
  ) {
    reportProblem("[razorpay] webhook signature mismatch");
    return reply(400, "invalid signature");
  }

  const event = WebhookEventSchema.safeParse(parseJson(raw));
  if (!event.success) return reply(400, "unrecognised payload");
  if (event.data.event !== CAPTURED_EVENT) return reply(200, "ignored");

  const paymentId = event.data.payload?.payment?.entity.id;
  if (!paymentId) {
    reportProblem(
      `[razorpay] ${CAPTURED_EVENT} arrived with no payment id; every confirmation depends on it`,
    );
    return reply(503, "no payment id");
  }

  const outcome = await confirmPayment(paymentId);
  if (outcome.isConfirmed) return reply(200, "confirmed");
  return RETRYABLE_REASONS.has(outcome.reason)
    ? reply(503, outcome.reason)
    : reply(200, outcome.reason);
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function reply(status: number, body: string): Response {
  return new Response(body, { status });
}
