import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Native deps used by API routes (PDF/DOCX parsing, Postgres pool). */
  serverExternalPackages: ["mammoth", "pdf-parse", "pg", "@huggingface/transformers", "onnxruntime-node"],
  outputFileTracingIncludes: {
    "/api/documents/upload": ["./node_modules/onnxruntime-node/package.json", "./node_modules/onnxruntime-node/dist/*.js", "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/onnxruntime_binding.node", "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime.so.1"],
    "/api/documents/qa": ["./node_modules/onnxruntime-node/package.json", "./node_modules/onnxruntime-node/dist/*.js", "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/onnxruntime_binding.node", "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime.so.1"],
    "/api/search": ["./node_modules/onnxruntime-node/package.json", "./node_modules/onnxruntime-node/dist/*.js", "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/onnxruntime_binding.node", "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime.so.1"],
    "/api/sql": ["./config/supabase-ca.crt"],
    "/api/analytics/summary": ["./config/supabase-ca.crt"],
  },
  outputFileTracingExcludes: {
    "/api/*": ["./node_modules/onnxruntime-node/bin/**/libonnxruntime_providers_cuda.so", "./node_modules/onnxruntime-node/bin/**/libonnxruntime_providers_tensorrt.so"],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
