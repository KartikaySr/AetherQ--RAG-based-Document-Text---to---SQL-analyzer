import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@xenova/transformers",
    "mammoth",
    "pdf-parse",
    "pg",
  ],
};

export default nextConfig;
