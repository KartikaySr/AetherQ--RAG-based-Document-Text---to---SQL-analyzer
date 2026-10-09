import { env, pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Keep the same 384-dimensional MiniLM embedding space for uploads and queries.
// A writable cache avoids downloading weights again after each request.
env.cacheDir = process.env.EMBEDDING_CACHE_DIR || join(tmpdir(), "aetherq-models");
env.allowLocalModels = false;
let extractor: Promise<FeatureExtractionPipeline> | undefined;
function getExtractor() {
  extractor ??= pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { dtype: "fp32" }).catch(error => {
    extractor = undefined;
    throw error;
  });
  return extractor;
}
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const model = await getExtractor();
  const result = await model(texts, { pooling: "mean", normalize: true });
  const vectors = result.tolist() as number[][];
  if (vectors.length !== texts.length || vectors.some(v => v.length !== 384 || v.some(n => !Number.isFinite(n)))) {
    throw new Error("Invalid embedding output.");
  }
  return vectors;
}
export async function embedQuery(text: string): Promise<number[]> {
  return (await embedTexts([text]))[0];
}
