/**
 * The site's default Trusted Types policy, inlined in `<head>` so it exists before
 * any chunk loads. Turbopack's chunk loader assigns a plain string to
 * `script.src`, which `require-trusted-types-for 'script'` blocks: without this,
 * lazily loaded chunks never arrive and client navigation falls back to a full
 * reload (measured). The policy signs same-origin `/_next/` script URLs and
 * nothing else; it defines no HTML or script rule, so an injected `innerHTML` or
 * inline script string stays blocked.
 */
import type { ReactNode } from "react";

const POLICY = `if (window.trustedTypes && !trustedTypes.defaultPolicy) {
  trustedTypes.createPolicy("default", {
    createScriptURL(url) {
      const target = new URL(url, location.href);
      if (target.origin === location.origin && target.pathname.startsWith("/_next/")) return url;
      throw new TypeError("Blocked script URL " + target.href);
    },
  });
}`;

export function TrustedTypesPolicy(): ReactNode {
  return <script>{POLICY}</script>;
}
