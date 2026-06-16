import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cf.geekdo-images.com',
      },
    ],
  },
  // The three former collection routes are now tabs of /collection.
  async redirects() {
    return [
      { source: '/all', destination: '/collection', permanent: true },
      { source: '/session', destination: '/collection?tab=session', permanent: true },
      { source: '/update', destination: '/collection?tab=bgg', permanent: true },
    ];
  },
};

export default nextConfig;
