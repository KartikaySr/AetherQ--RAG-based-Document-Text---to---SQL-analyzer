import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Native deps used by API routes (PDF/DOCX parsing, Postgres pool). */
  serverExternalPackages: ["mammoth", "pdf-parse", "pg"],
};

export default nextConfig;
