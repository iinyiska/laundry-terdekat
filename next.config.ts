import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: For Capacitor APK build, use 'output: export' locally
  // For Vercel deployment, we use server-side rendering (default)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
