/**
 * Framework configuration. Instant Navigations need `cacheComponents` and
 * `partialPrefetching` together; the React Compiler runs as the Rust port inside
 * Turbopack, so there is no Babel plugin to install. Each module that loads
 * third-party code adds its CSP sources through one marked import and entry.
 */
import type { NextConfig } from "next";
import { DEV_CSP, routeHeaders } from "./src/lib/security-headers.ts";
/** @module razorpay */
import {
  RAZORPAY_CSP,
  RAZORPAY_CSP_EXEMPTION,
} from "./src/modules/razorpay/csp.ts";
/** @module supabase */
import { SUPABASE_CSP } from "./src/modules/supabase/csp.ts";
import type { CspExemptionType, CspSourcesType } from "./src/types/security.ts";

const MODULE_CSP: readonly CspSourcesType[] = [
  /** @module razorpay */
  RAZORPAY_CSP,
  /** @module supabase */
  SUPABASE_CSP,
];

const CSP_EXEMPTIONS: readonly CspExemptionType[] = [
  /** @module razorpay */
  RAZORPAY_CSP_EXEMPTION,
];

const CSP_SOURCES =
  process.env.NODE_ENV === "development"
    ? [...MODULE_CSP, DEV_CSP]
    : MODULE_CSP;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    turbopackRustReactCompiler: true,
    sri: { algorithm: "sha256" },
    /** On only for the e2e build, which sets NEXT_E2E; a real deployment never exposes it. */
    exposeTestingApiInProductionBuild: process.env.NEXT_E2E === "1",
  },
  async headers() {
    return routeHeaders(CSP_SOURCES, CSP_EXEMPTIONS);
  },
};

export default nextConfig;
