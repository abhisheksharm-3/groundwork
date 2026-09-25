/** Long-form text on the page ground: policies and anything else read top to bottom. */
import type { ReactNode } from "react";
import type { ChildrenPropsType } from "@/types/ui";

export function Prose({ children }: ChildrenPropsType): ReactNode {
  return (
    <div className="page py-section">
      <article className="max-w-(--container-prose) text-ink-soft [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:text-ink [&_h2:first-child]:mt-0 [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </article>
    </div>
  );
}
