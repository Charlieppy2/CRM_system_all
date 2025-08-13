import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '',
  assetPrefix: '',
  env: {
    CUSTOM_KEY: 'my-value',
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },
};

export default nextConfig;
