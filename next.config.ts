import type { NextConfig } from "next";
import path from "node:path";

const isProd = process.env.NODE_ENV === "production";

// Dev tooling (React refresh, Turbopack) needs eval, so the strict policy applies to production builds only.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // Next.js emits inline bootstrap scripts; no nonce support without dynamic rendering everywhere
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProd
    ? [
        { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
        { key: "Strict-Transport-Security", value: "max-age=31536000" },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  poweredByHeader: false,
  // Extra hosts allowed to reach the dev server (e.g. a LAN/Tailscale IP), comma-separated.
  allowedDevOrigins: process.env.DEV_ALLOWED_ORIGINS?.split(",").filter(Boolean),
  outputFileTracingRoot: path.resolve(__dirname),
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return [
      { source: "/towers", destination: "/#towers", permanent: false },
      { source: "/towers/:id", destination: "/#towers", permanent: false },
      { source: "/submit", destination: "/#towers", permanent: false },
      // The in-between merch page is gone: /shop forwards to the external shop, or home when none is set.
      { source: "/shop", destination: process.env.NEXT_PUBLIC_SHOP_URL?.trim() || "/", permanent: false },
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
