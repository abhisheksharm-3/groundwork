/** A link that reads as a button: the site's calls to action. */

import { cn } from "cn";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ActionLinkPropsType } from "@/types/ui";
import { actionStyles } from "./action-styles";

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
