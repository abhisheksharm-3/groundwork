/**
 * Framework configuration. Instant Navigations need `cacheComponents` and
 * `partialPrefetching` together; the React Compiler runs as the Rust port inside
 * Turbopack, so there is no Babel plugin to install.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    turbopackRustReactCompiler: true,
  },
};

export default nextConfig;
