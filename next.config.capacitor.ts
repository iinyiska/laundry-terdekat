import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export', // Required for Capacitor static files
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
