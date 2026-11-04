import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Request-time rendering model (simpler for a DB-driven store)
  cacheComponents: false,
  experimental: {
    serverActions: { bodySizeLimit: "4mb" }, // product image uploads to R2 (Vercel max body is 4.5MB)
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.dummyjson.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "**" }, // admins may paste image URLs from any https host
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
