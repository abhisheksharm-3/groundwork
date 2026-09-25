/** A link that reads as a button: the site's calls to action. */

import { cn } from "cn";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { type ActionVariantType, actionStyles } from "./action-styles";

type ActionLinkPropsType = {
  href: Route;
  variant?: ActionVariantType;
  className?: string;
  children: ReactNode;
};

export function ActionLink({
  href,
  variant = "brand",
  className,
  children,
}: ActionLinkPropsType): ReactNode {
  return (
    <Link href={href} className={cn(actionStyles(variant), className)}>
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
