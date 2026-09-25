"use client";

/**
 * Reveals each direct child as it scrolls into view, with no wrapper element: a
 * ref on the Fragment observes the children themselves. A child already on
 * screen when the observer first reports is never hidden, so nothing flickers,
 * and with JavaScript off every child simply renders.
 */
import {
  Fragment,
  type FragmentInstance,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import type { ChildrenPropsType } from "@/types/ui";

export function Reveal({ children }: ChildrenPropsType): ReactNode {
  const ref = useRef<FragmentInstance>(null);

  useEffect(() => {
    const fragment = ref.current;
    if (!fragment) return;
    const observer = new IntersectionObserver(markEntries, {
      rootMargin: "0% 0% -12% 0%",
    });
    fragment.observeUsing(observer);
    return () => fragment.unobserveUsing(observer);
  }, []);

  return <Fragment ref={ref}>{children}</Fragment>;
}

/** Staggers the children that arrive together, so a row reveals left to right. */
function markEntries(
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
): void {
  let step = 0;
  for (const { target, isIntersecting } of entries) {
    if (!(target instanceof HTMLElement)) continue;
    if (isIntersecting) {
      target.style.setProperty("--step", String(step++));
      target.dataset.reveal = "shown";
      observer.unobserve(target);
    } else if (!target.dataset.reveal) {
      target.dataset.reveal = "pending";
    }
  }
}
