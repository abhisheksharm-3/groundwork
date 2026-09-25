/** A URL that matches no page. */
import type { ReactNode } from "react";
import { ActionLink } from "@/components/site/ActionLink";

export default function NotFound(): ReactNode {
  return (
    <section className="on-brand">
      <div className="page flex min-h-[70svh] flex-col justify-center py-section">
        <p className="label text-action">Not found</p>
        <h1 className="mt-5 max-w-[16ch] text-3xl">That thread goes nowhere</h1>
        <p className="mt-6 max-w-(--container-prose) text-lg text-on-brand-soft">
          The page you followed has moved or never existed.
        </p>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-5">
          <ActionLink href="/" variant="action">
            Back to the start
          </ActionLink>
          <ActionLink href="/pricing" variant="quiet">
            See the passes
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
