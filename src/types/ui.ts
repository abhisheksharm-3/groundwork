/** Props for the shared site components and the error boundaries. */
import type { Route } from "next";
import type { ReactNode } from "react";

export type ActionVariantType = "action" | "brand" | "quiet";

export type ActionLinkPropsType = {
  href: Route;
  variant?: ActionVariantType;
  className?: string;
  children: ReactNode;
};

export type PageMastPropsType = {
  eyebrow: string;
  title: string;
  lede: string;
};

/** What Next passes an `error.tsx` or `global-error.tsx` boundary. */
export type ErrorBoundaryPropsType = {
  error: Error & { digest?: string };
  retry: () => void;
};
