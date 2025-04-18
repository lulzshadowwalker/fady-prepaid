import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "**.googleapis.com" },
      { hostname: "**.jetadmin.app" },
      { hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
