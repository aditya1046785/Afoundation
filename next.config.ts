import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return ["/admin/:path*", "/member/:path*", "/login", "/register", "/pending-approval"].map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
  images: {
    remotePatterns: [
      {
        // Allow any HTTPS image source (needed for gallery, member photos, etc.)
        protocol: "https",
        hostname: "**",
      },
      {
        // Allow any HTTP image source (for local/dev environments)
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
