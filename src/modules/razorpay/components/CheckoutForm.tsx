"use client";

/**
 * Collects the buyer's details, asks the server for an order, then opens
 * Razorpay's Checkout on it. Checkout's script loads on submit, not on page
 * load, so a visitor who only looks never downloads it. On success the browser
 * goes to the confirmation page; the receipt itself is sent by the webhook.
 */
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { actionStyles } from "@/components/site/action-styles";
import { FormField } from "@/components/site/FormField";
import { Input } from "@/components/ui/input";
import { SITE } from "@/lib/site-config";
import { createOrderAction } from "../actions";
import { RAZORPAY } from "../constants";
import type {
  CheckoutFormPropsType,
  CheckoutStateType,
  CheckoutSuccessType,
} from "../types";

const INITIAL: CheckoutStateType = { status: "idle" };

export function CheckoutForm({
  passId,
  passName,
}: CheckoutFormPropsType): ReactNode {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createOrderAction,
    INITIAL,
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const openedOrder = useRef<string | null>(null);
  const errors = state.status === "invalid" ? state.errors : {};

  useEffect(() => {
    if (state.status !== "ready" || openedOrder.current === state.orderId)
      return;
    openedOrder.current = state.orderId;
    setCheckoutError(null);
    loadCheckout()
      .then((Checkout) => {
        new Checkout({
          key: state.keyId,
          order_id: state.orderId,
          amount: state.amountPaise,
          currency: RAZORPAY.currency,
          name: `${SITE.name} ${SITE.edition}`,
          description: passName,
          prefill: state.prefill,
          theme: { color: SITE.chrome.ground },
          handler: (response: CheckoutSuccessType) => {
            const query = new URLSearchParams({
              order: response.razorpay_order_id,
              payment: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            router.push(`/checkout/confirmed?${query}`);
          },
          modal: { ondismiss: () => (openedOrder.current = null) },
        }).open();
      })
      .catch(() => {
        openedOrder.current = null;
        setCheckoutError(
          "The payment window could not be opened. Check your connection and try again.",
        );
      });
  }, [state, passName, router]);

  const announcement =
    checkoutError ?? (state.status === "failed" ? state.message : "");

  return (
    <form
      action={formAction}
      aria-busy={isPending}
      noValidate
      className="grid gap-6"
    >
      <input type="hidden" name="passId" value={passId} />
      <p
        role="alert"
        className={
          announcement
            ? "rounded-md bg-signal-tint px-5 py-4 text-signal"
            : "sr-only"
        }
      >
        {announcement}
      </p>
      <FormField name="name" label="Name on the pass" error={errors.name}>
        {(props) => <Input {...props} autoComplete="name" required />}
      </FormField>
      <FormField
        name="email"
        label="Email"
        hint="The receipt goes here."
        error={errors.email}
      >
        {(props) => (
          <Input {...props} type="email" autoComplete="email" required />
        )}
      </FormField>
      <FormField
        name="phone"
        label="Mobile number"
        hint="10 digits. Razorpay may send a one-time code."
        error={errors.phone}
      >
        {(props) => (
          <Input
            {...props}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
          />
        )}
      </FormField>
      <div>
        <button
          type="submit"
          aria-disabled={isPending}
          onClick={(event) => {
            if (isPending) event.preventDefault();
          }}
          className={actionStyles("action")}
        >
          {isPending ? "Opening payment…" : "Continue to payment"}
        </button>
      </div>
      <p className="text-sm text-ink-soft">
        Payment is taken by Razorpay. This site never sees your card or UPI
        details.
      </p>
    </form>
  );
}

/**
 * Trusted Types forbids assigning a plain string to `script.src`. This policy
 * signs exactly one URL, Razorpay's checkout script, and refuses anything else,
 * so it cannot be turned into a way to load arbitrary code.
 */
let checkoutPolicy: TrustedTypePolicyType | undefined;

function checkoutScriptUrl(): string {
  if (!window.trustedTypes) return RAZORPAY.checkoutScript;
  checkoutPolicy ??= window.trustedTypes.createPolicy("razorpay-checkout", {
    createScriptURL: (input) => {
      if (input !== RAZORPAY.checkoutScript)
        throw new TypeError(`Refusing to load ${input}`);
      return input;
    },
  });
  return checkoutPolicy.createScriptURL(RAZORPAY.checkoutScript);
}

function loadCheckout(): Promise<NonNullable<Window["Razorpay"]>> {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = checkoutScriptUrl();
    script.onload = () =>
      window.Razorpay
        ? resolve(window.Razorpay)
        : reject(new Error("checkout unavailable"));
    script.onerror = () => reject(new Error("checkout script failed to load"));
    document.head.appendChild(script);
  });
}
