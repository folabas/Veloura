import path from "node:path";
import type { NextConfig } from "next";

// Product photos come from the content API (Render). Allow its address for next/image.
const api = process.env.API_URL ? new URL(process.env.API_URL) : null;

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user folder otherwise makes Next guess the wrong project root.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // AVIF is noticeably smaller than WebP for photos; browsers without it get WebP.
    formats: ["image/avif", "image/webp"],
    // Every photo is served at quality 90 (Next's default is 75), so prints and fabric stay crisp.
    qualities: [90],
    // Up to 4K-wide screens, so full-width photos stay sharp on large high-resolution displays.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 2560, 3840],
    // Product photos rarely change, so let browsers and CDNs keep resized copies for a month.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      ...(api ? [{ protocol: api.protocol.replace(":", "") as "http" | "https", hostname: api.hostname, port: api.port, pathname: "/images/**" }] : []),
      { protocol: "https", hostname: "*.onrender.com", pathname: "/images/**" },
    ],
  },
  // The admin panel lives on the content API (Render) but opens at this site's /admin.
  // Requests are passed through, so sign-in stays on the website's own address.
  async rewrites() {
    if (!api) return [];
    const origin = api.origin;
    return [
      { source: "/admin", destination: `${origin}/admin` },
      { source: "/admin/:path*", destination: `${origin}/admin/:path*` },
      { source: "/api/admin/:path*", destination: `${origin}/api/admin/:path*` },
    ];
  },
  experimental: {
    // Ships only the GSAP pieces actually used.
    optimizePackageImports: ["gsap"],
  },
};

export default nextConfig;
