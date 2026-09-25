/**
 * Razorpay's keys. Test keys start rzp_test_ and live keys rzp_live_; nothing
 * branches on which. All three are needed before the site takes money: without
 * the webhook secret no payment could ever be confirmed.
 */
import { OPTIONAL_TEXT } from "@/lib/env-fields";

export const RAZORPAY_ENV = {
  RAZORPAY_KEY_ID: OPTIONAL_TEXT,
  RAZORPAY_KEY_SECRET: OPTIONAL_TEXT,
  RAZORPAY_WEBHOOK_SECRET: OPTIONAL_TEXT,
};
