import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow next/image to load images from ImageKit's CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // Keep @imagekit/nodejs server-side only — never bundle it for the browser
  serverExternalPackages: ['@imagekit/nodejs'],
};

export default nextConfig;
