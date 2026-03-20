import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone only when building inside Docker
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  reactCompiler: true,
  compress: true,
  images: {
    unoptimized: true,
  },
  // Turbopack for 10x faster local dev HMR
  turbopack: {},
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
