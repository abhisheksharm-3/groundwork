/** Razorpay's responses as this module reads them, and the shapes the checkout flow passes around. */
import type { z } from "zod";
import type { RazorpayOrderSchema, RazorpayPaymentSchema } from "./schemas";

/** Razorpay's order as parsed; `amount` is paise and the authority on what was charged. */
export type RazorpayOrderType = z.infer<typeof RazorpayOrderSchema>;

/** Razorpay's payment as parsed; "captured" is the only status that means the money is taken. */
export type RazorpayPaymentType = z.infer<typeof RazorpayPaymentSchema>;

export type BuyerType = { name: string; email: string; phone: string };

export type SaleType = {
  buyer: BuyerType;
  passName: string;
  paymentId: string;
  orderId: string;
  /** Whole rupees, taken from the payment, never from the notes. */
  amount: number;
};

export type ConfirmReasonType =
  | "payment-unreadable"
  | "already-confirmed"
  | "not-captured"
  | "order-unreadable"
  | "mail-failed";

export type ConfirmOutcomeType =
  | { isConfirmed: true }
  | { isConfirmed: false; reason: ConfirmReasonType };

export type CheckoutFieldType = keyof BuyerType;

export type CheckoutStateType =
  | { status: "idle" }
  | { status: "invalid"; errors: Partial<Record<CheckoutFieldType, string>> }
  | { status: "failed"; message: string }
  | {
      status: "ready";
      keyId: string;
      orderId: string;
      amountPaise: number;
      prefill: { name: string; email: string; contact: string };
    };

/** What Razorpay's Checkout hands the success handler. */
export type CheckoutSuccessType = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

/** The global Razorpay's checkout.js defines, reduced to what this module calls. */
export type RazorpayCheckoutType = new (
  options: Record<string, unknown>,
) => {
  open: () => void;
  on: (event: "payment.failed", handler: () => void) => void;
};

export type PaymentReturnType = {
  order?: string;
  payment?: string;
  signature?: string;
};

export type SaleEmailPropsType = { sale: SaleType };

export type CheckoutFormPropsType = { passId: string; passName: string };

export type PaymentStatusPropsType = {
  searchParams: Promise<PaymentReturnType>;
};

export type CheckoutParamsType = { pass: string };
