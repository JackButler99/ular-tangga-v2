import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.26.69.182"],

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