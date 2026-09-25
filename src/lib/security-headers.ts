/**
 * The response headers every page carries, with the Content Security Policy built
 * from a core policy plus whatever sources each module contributes. It lives
 * here rather than in proxy.ts so it survives Supabase being stripped, and so a
 * check file can assert on it.
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

/** Extra sources a module needs, keyed by CSP directive. */
export type CspSourcesType = Partial<Record<string, readonly string[]>>;

type HeaderType = { key: string; value: string };

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

/** React's development build needs eval to rebuild server error stacks in the browser. */
const DEV_ONLY: CspSourcesType = { "script-src": ["'unsafe-eval'"] };

export function buildCsp(
  modules: readonly CspSourcesType[],
  isDev: boolean,
): string {
  const merged = new Map<string, Set<string>>(
    Object.entries(CORE).map(([directive, sources]) => [
      directive,
      new Set(sources),
    ]),
  );
  for (const extra of isDev ? [...modules, DEV_ONLY] : modules) {
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
