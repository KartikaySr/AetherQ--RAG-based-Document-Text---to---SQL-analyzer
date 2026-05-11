import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@xenova/transformers",
    "pdf-parse",
    "onnxruntime-node",
  ],
};

export default nextConfig;