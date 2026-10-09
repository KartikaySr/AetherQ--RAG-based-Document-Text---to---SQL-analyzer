import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Native deps used by API routes (PDF/DOCX parsing, Postgres pool). */
  serverExternalPackages: ["mammoth", "pdf-parse", "pg", "@huggingface/transformers", "onnxruntime-node"],
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
