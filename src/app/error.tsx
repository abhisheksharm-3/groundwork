"use client";

/**
 * A route failed to render. `retry` re-fetches and re-renders the failed segment
 * inside a transition, so a flaky upstream recovers without a full reload. This
 * is the plain file convention: it already sits inside Next's own boundary and
 * leaves `notFound()` and `redirect()` alone, so it is not wrapped in catchError.
 */
import type { ReactNode } from "react";
import { actionStyles } from "@/components/site/action-styles";
import { SITE } from "@/lib/site-config";

type ErrorPropsType = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function RouteError({
  error,
  retry,
}: ErrorPropsType): ReactNode {
  return (
    <section className="on-brand">
      <div className="page flex min-h-[70svh] flex-col justify-center py-section">
        <p className="label text-action">Something did not load</p>
        <h1 className="mt-5 max-w-[16ch] text-3xl">
          This page did not come through
        </h1>
        <p className="mt-6 max-w-(--container-prose) text-lg text-on-brand-soft">
          Try again. If it keeps failing, write to {SITE.contact.email}
          {error.digest ? ` and quote reference ${error.digest}` : ""}.
        </p>
        <div className="mt-10">
          <button
            type="button"
            onClick={retry}
            className={actionStyles("action")}
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}
