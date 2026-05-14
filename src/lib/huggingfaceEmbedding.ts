/**
 * Hugging Face Inference embedding endpoint.
 * Override with HUGGINGFACE_EMBEDDING_URL if your account uses a different router or model.
 *
 * Default: sentence-transformers/all-MiniLM-L6-v2 → 384-dim (must match pgvector column).
 */
export function getHuggingFaceEmbeddingUrl(): string {
  const fromEnv = process.env.HUGGINGFACE_EMBEDDING_URL?.trim();
  if (fromEnv) return fromEnv;

  return "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";
}
