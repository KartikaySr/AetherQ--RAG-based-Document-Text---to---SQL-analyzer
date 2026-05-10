import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mammoth", "pdf-parse", "pg"],
};

export default nextConfig;
