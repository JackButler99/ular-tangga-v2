import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.13"],

  async redirects() {
    return [
      {
        source: "/",
        has: [
          {
            type: "query",
            key: "room",
          },
        ],
        destination: "/games/ular-tangga",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;