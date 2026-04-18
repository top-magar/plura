import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { hostname: "fra.cloud.appwrite.io" },
      { hostname: "img.clerk.com" },
      { hostname: "subdomain" },
      { hostname: "files.stripe.com" },
    ],
  },
};

export default nextConfig;
