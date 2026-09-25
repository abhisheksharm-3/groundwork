"use client";

/**
 * Keeps a failure inside the checkout widget from taking the page with it. The
 * pass details stay on screen, and "Try again" re-renders the widget without a
 * reload. `notFound()` and `redirect()` pass through untouched.
 */
import { catchError, type ErrorInfo } from "next/error";
import type { ReactNode } from "react";
import { actionStyles } from "@/components/site/action-styles";
import { SITE } from "@/lib/site-config";
import type { ChildrenPropsType } from "@/types/ui";

function CheckoutFallback(
  { children: _widget }: ChildrenPropsType,
  { retry }: ErrorInfo,
): ReactNode {
  return (
    <div role="alert" className="rounded-lg bg-signal-tint p-8">
      <p className="text-lg text-signal">The payment form did not load.</p>
      <p className="mt-2 text-ink-soft">
        Try again, or write to {SITE.contact.email} and we will book your pass
        directly.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className={`${actionStyles("brand")} mt-6`}
      >
        Try again
      </button>
    </div>
  );
}

export const CheckoutBoundary = catchError(CheckoutFallback);
