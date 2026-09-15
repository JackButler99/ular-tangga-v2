import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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