import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@oto/core", "@oto/protocol", "@oto/ui", "@oto/db"],
};

export default nextConfig;
