import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "imagedelivery.net" },
    ],
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
