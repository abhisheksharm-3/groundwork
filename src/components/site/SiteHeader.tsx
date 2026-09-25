"use client";

import { cn } from "cn";
/**
 * The site header. Every link carries a view-transition type from its position
 * in the nav, so moving right along the nav slides forward and moving left
 * slides back. On small screens the nav collapses into a native `<details>`,
 * keyed by path so it closes on every navigation without an effect.
 */
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site-config";
import type { NavLinksPropsType } from "@/types/ui";
import { actionStyles } from "./action-styles";

const ORDER: readonly string[] = SITE.nav.map((item) => item.href);

export function SiteHeader(): ReactNode {
  const pathname = usePathname();

  return (
    <header className="on-brand sticky top-0 z-40 border-b border-on-brand/10">
      <div className="page flex items-center gap-6 py-4">
        <Link
          href="/"
          transitionTypes={directionTo("/", pathname)}
          className="flex items-baseline gap-2"
        >
          <span className="font-display text-2xl leading-none">
            {SITE.name}
          </span>
          <span className="label text-on-brand-soft">{SITE.edition}</span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden md:block">
          <NavLinks pathname={pathname} />
        </nav>

        <Link
          href="/pricing"
          transitionTypes={directionTo("/pricing", pathname)}
          className={cn(
            actionStyles("action"),
            "hidden px-5 py-3 md:inline-flex",
          )}
        >
          Get a pass
        </Link>

        <details key={pathname} className="group ml-auto md:hidden">
          <summary className="label cursor-pointer list-none rounded-md border border-on-brand/25 px-4 py-2.5 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Menu</span>
            <span className="hidden group-open:inline">Close</span>
          </summary>
          <nav
            aria-label="Main"
            className="on-brand absolute inset-x-0 top-full border-b border-on-brand/10 pb-8"
          >
            <div className="page flex flex-col gap-6 pt-6">
              <NavLinks pathname={pathname} />
              <Link href="/pricing" className={actionStyles("action")}>
                Get a pass
              </Link>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}

function NavLinks({ pathname }: NavLinksPropsType): ReactNode {
  const items = SITE.account ? [...SITE.nav, SITE.account] : SITE.nav;
  return (
    <ul className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
      {items.slice(1).map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            transitionTypes={directionTo(item.href, pathname)}
            aria-current={item.href === pathname ? "page" : undefined}
            className="label text-on-brand-soft transition-colors hover:text-on-brand aria-[current=page]:text-action"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Pages outside the main nav (checkout, account) count as the far right of it. */
function directionTo(href: Route, pathname: string): string[] {
  const rank = (path: string): number => {
    const index = ORDER.indexOf(path);
    return index === -1 ? ORDER.length : index;
  };
  if (href === pathname) return [];
  return [rank(href) > rank(pathname) ? "nav-forward" : "nav-back"];
}
