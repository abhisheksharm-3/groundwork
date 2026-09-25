/**
 * The response headers every page carries, with the Content Security Policy built
 * from a core policy plus whatever sources each module contributes. It lives
 * here rather than in a proxy, so it applies whether or not a module adds one,
 * and so a check file can assert on it.
 *
 * Scripts must allow `'unsafe-inline'`. The App Router ships its RSC payload and
 * every Suspense reveal as inline scripts; `script-src 'self'` stops the page
 * hydrating and the streamed content never arrives, which was measured, not
 * assumed. Nonces would allow them but force every page to render per request,
 * which removes the static shell Instant Navigations depend on. Trusted Types,
 * React's escaping and no `'unsafe-eval'` outside dev carry the XSS defence.
 * Styles allow `'unsafe-inline'` because next/image blur placeholders are inline
 * style attributes.
 */
import type {
  CspExemptionType,
  CspSourcesType,
  HeaderType,
  RouteHeadersType,
} from "../types/security.ts";

const CORE: Record<string, readonly string[]> = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:"],
  "font-src": ["'self'"],
  "connect-src": ["'self'"],
  "frame-src": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "require-trusted-types-for": ["'script'"],
};

/** React's development build needs eval to rebuild server error stacks in the browser. Add it only in dev. */
export const DEV_CSP: CspSourcesType = { "script-src": ["'unsafe-eval'"] };

/** No exemption may reopen framing, plugins or the document base, whatever a module asks for. */
const PROTECTED: ReadonlySet<string> = new Set([
  "frame-ancestors",
  "object-src",
  "base-uri",
  "default-src",
]);

/** The policy: the core, minus any directives in `drop`, plus every source in `extras`. */
export function buildCsp(
  extras: readonly CspSourcesType[],
  drop: readonly string[] = [],
): string {
  const merged = new Map<string, Set<string>>(
    Object.entries(CORE)
      .filter(([directive]) => !drop.includes(directive))
      .map(([directive, sources]) => [directive, new Set(sources)]),
  );
  for (const extra of extras) {
    for (const [directive, sources = []] of Object.entries(extra)) {
      const set = merged.get(directive) ?? new Set<string>();
      if (sources.length > 0) set.delete("'none'");
      for (const source of sources) set.add(source);
      merged.set(directive, set);
    }
  }
  return [...merged]
    .map(([directive, sources]) => `${directive} ${[...sources].join(" ")}`)
    .join("; ");
}

/**
 * The header rules for next.config: every route gets the full policy, then each
 * exemption's route gets the policy minus the directives it names. Next applies
 * the later rule when two set the same header on one path.
 */
export function routeHeaders(
  extras: readonly CspSourcesType[],
  exemptions: readonly CspExemptionType[],
): RouteHeadersType[] {
  const rules: RouteHeadersType[] = [
    { source: "/(.*)", headers: securityHeaders(buildCsp(extras)) },
  ];
  for (const exemption of exemptions) {
    const refused = exemption.drop.filter((directive) =>
      PROTECTED.has(directive),
    );
    if (refused.length > 0)
      throw new Error(`A CSP exemption may not drop ${refused.join(", ")}`);
    rules.push({
      source: exemption.source,
      headers: securityHeaders(buildCsp(extras, exemption.drop)),
    });
  }
  return rules;
}

export function securityHeaders(csp: string): HeaderType[] {
  return [
    { key: "Content-Security-Policy", value: csp },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ];
}
