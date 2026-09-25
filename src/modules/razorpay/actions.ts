"use server";

/**
 * Opens a Razorpay order for a pass. Nothing is sold here: a sale exists once the
 * payment is captured and the webhook confirms it. The amount is computed from the
 * pass id and the server clock, and the form has no field for money, so nothing
 * a browser sends can change what it is charged.
 */
import { clientAddress } from "@/lib/client-address";
import { firstFieldErrors } from "@/lib/field-errors";
import { findPass } from "@/lib/pricing";
import { createRateLimiter } from "@/lib/rate-limit";
import { reportProblem } from "@/lib/report-problem";
import { SITE } from "@/lib/site-config";
import { createOrder, publicKeyId } from "./client";
import { amountPaise } from "./price";
import { CheckoutSchema } from "./schemas";
import type {
  CheckoutFieldType,
  CheckoutStateType,
  RazorpayOrderType,
} from "./types";

const FIELDS: readonly CheckoutFieldType[] = ["name", "email", "phone"];

const isAllowed = createRateLimiter({ limit: 10, windowMs: 60_000 });

const UNAVAILABLE = `Online payment is not switched on yet. Write to ${SITE.contact.email} and we will book your pass directly.`;

export async function createOrderAction(
  _previous: CheckoutStateType,
  formData: FormData,
): Promise<CheckoutStateType> {
  const raw = {
    passId: formData.get("passId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  };

  if (!isAllowed(await clientAddress())) {
    return {
      status: "failed",
      message: "Too many attempts from this address. Try again in a minute.",
    };
  }
  const keyId = publicKeyId();
  if (!keyId) {
    reportProblem(
      "[razorpay] refusing an order: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET must all be set",
    );
    return { status: "failed", message: UNAVAILABLE };
  }

  const parsed = CheckoutSchema.safeParse(raw);
  if (!parsed.success)
    return {
      status: "invalid",
      errors: firstFieldErrors(parsed.error.issues, FIELDS),
    };
  const { passId, name, email, phone } = parsed.data;
  if (!findPass(passId))
    return { status: "failed", message: "That pass is not on sale." };

  const expected = amountPaise(passId, Date.now());
  const order = await openOrder(expected, { pass: passId, name, email, phone });
  if (!order)
    return {
      status: "failed",
      message: "Could not reach the payment gateway. Please try again.",
    };
  if (order.amount !== expected) {
    reportProblem(
      `[razorpay] order ${order.id} priced ${order.amount} paise, expected ${expected}`,
    );
    return {
      status: "failed",
      message: `Could not price your pass. Write to ${SITE.contact.email}.`,
    };
  }

  return {
    status: "ready",
    keyId,
    orderId: order.id,
    amountPaise: order.amount,
    prefill: { name, email, contact: phone },
  };
}

async function openOrder(
  amount: number,
  notes: Record<string, string>,
): Promise<RazorpayOrderType | null> {
  try {
    return await createOrder({
      amountPaise: amount,
      receipt: `${notes.pass}-${Date.now().toString(36)}`,
      notes,
    });
  } catch (error) {
    reportProblem("[razorpay] order creation failed:", error);
    return null;
  }
}
