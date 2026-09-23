import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< Updated upstream
  allowedDevOrigins: ["192.168.100.13"],
=======
  allowedDevOrigins: ["10.228.77.182"],
>>>>>>> Stashed changes

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