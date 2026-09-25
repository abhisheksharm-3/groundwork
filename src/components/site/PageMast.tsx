/** The drenched opening band of an inner page, closed by the selvedge. */
import type { ReactNode } from "react";

type PageMastPropsType = {
  eyebrow: string;
  title: string;
  lede: string;
};

export function PageMast({
  eyebrow,
  title,
  lede,
}: PageMastPropsType): ReactNode {
  return (
    <div className="on-brand">
      <div className="page pt-section pb-[calc(var(--spacing-section)*0.6)]">
        <p className="label enter text-action">{eyebrow}</p>
        <h1 className="enter mt-5 max-w-[14ch] text-3xl [--step:1]">{title}</h1>
        <p className="enter mt-6 max-w-(--container-prose) text-lg text-on-brand-soft [--step:2]">
          {lede}
        </p>
      </div>
      <div className="selvedge text-action" />
    </div>
  );
}
