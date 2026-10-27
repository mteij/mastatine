import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // Extra hosts allowed to reach the dev server (e.g. a LAN/Tailscale IP), comma-separated.
  allowedDevOrigins: process.env.DEV_ALLOWED_ORIGINS?.split(",").filter(Boolean),
  outputFileTracingRoot: path.resolve(__dirname),
  async redirects() {
    return [
      { source: "/towers", destination: "/#towers", permanent: false },
      { source: "/towers/:id", destination: "/#towers", permanent: false },
      { source: "/submit", destination: "/#submit", permanent: false },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    localPatterns: [{ pathname: "/uploads/**" }, { pathname: "/klok.png" }],
    // Only needed until legacy Supabase image URLs are migrated by scripts/migrate-from-supabase.mjs.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/towers/**" }],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
