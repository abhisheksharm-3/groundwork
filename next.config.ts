/**
 * Framework configuration. Instant Navigations need `cacheComponents` and
 * `partialPrefetching` together; the React Compiler runs as the Rust port inside
 * Turbopack, so there is no Babel plugin to install. Each module that loads
 * third-party code adds its CSP sources through one marked import and entry.
 */
import type { NextConfig } from "next";
import {
  buildCsp,
  type CspSourcesType,
  securityHeaders,
} from "./src/lib/security-headers.ts";

const MODULE_CSP: readonly CspSourcesType[] = [];

const CSP = buildCsp(MODULE_CSP, process.env.NODE_ENV === "development");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    turbopackRustReactCompiler: true,
    sri: { algorithm: "sha256" },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders(CSP) }];
  },
};

export default nextConfig;
