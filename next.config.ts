import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Native deps used by API routes (PDF/DOCX parsing, Postgres pool). */
  serverExternalPackages: ["mammoth", "pdf-parse", "pg", "@huggingface/transformers", "onnxruntime-node"],
  outputFileTracingIncludes: {
    "/api/documents/upload": ["./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/*"],
    "/api/documents/qa": ["./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/*"],
    "/api/search": ["./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/*"],
    "/api/sql": ["./config/supabase-ca.crt"],
    "/api/analytics/summary": ["./config/supabase-ca.crt"],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
