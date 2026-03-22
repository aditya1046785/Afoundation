import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
