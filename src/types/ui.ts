/** Props for the shared site components and the error boundaries. */
import type { Route } from "next";
import type { ReactNode } from "react";
import type { PassType } from "./site";

export type ActionVariantType = "action" | "brand" | "quiet";

/** Generic over the href, as next/link is, so a computed dynamic route type-checks. */
export type ActionLinkPropsType<HrefType extends string> = {
  href: Route<HrefType>;
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

export type FormControlPropsType = {
  id: string;
  name: string;
  className: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

export type FormFieldPropsType = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  children: (props: FormControlPropsType) => ReactNode;
};

export type PassPricePropsType = { pass: PassType };
