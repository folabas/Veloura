import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user folder otherwise makes Next guess the wrong project root.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // AVIF is noticeably smaller than WebP for photos; browsers without it get WebP.
    formats: ["image/avif", "image/webp"],
    // Product photos rarely change, so let browsers and CDNs keep resized copies for a month.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    // Ships only the GSAP pieces actually used.
    optimizePackageImports: ["gsap"],
  },
};

export default nextConfig;
