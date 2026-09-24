import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/user-dashboard/expense-manager',
        destination: '/user-dashboard/digital-khata/daily',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
