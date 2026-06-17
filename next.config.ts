import type { NextConfig } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const origin = appUrl.replace(/^https?:\/\//, "");

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [origin, "localhost:3000"],
    },
  },
};

export default nextConfig;
