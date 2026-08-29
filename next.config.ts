import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone only when building inside Docker
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  reactCompiler: true,
  compress: true,
  cacheComponents: true,
  // Every <Link> prefetches its destination's shared App Shell instead of a
  // per-link full prefetch. Requires cacheComponents.
  partialPrefetching: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      // httpsnippet's bundled form-data does a bare `require("fs")` at module
      // scope. Stub it out for browser builds only; server code is untouched.
      fs: { browser: "./src/lib/stubs/node-fs-browser.ts" },
    },
  },
  experimental: {
    optimizePackageImports: [
      "@tabler/icons-react",
      "lucide-react",
      "recharts",
      "date-fns",
    ],
  },
};

export default nextConfig;
