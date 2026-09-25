/**
 * Directional slide between routes. The nav tags each link `nav-forward` or
 * `nav-back`; untyped transitions (the browser's own back button, a refresh)
 * animate nothing. It wraps each page rather than the layout, because a layout
 * persists across navigations and its enter and exit never fire.
 */
import { type ReactNode, ViewTransition } from "react";
import type { ChildrenPropsType } from "@/types/ui";

const DIRECTIONS = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
};

export function PageTransition({ children }: ChildrenPropsType): ReactNode {
  return (
    <ViewTransition enter={DIRECTIONS} exit={DIRECTIONS} default="none">
      {children}
    </ViewTransition>
  );
}
