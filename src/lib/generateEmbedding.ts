import { pipeline } from "@xenova/transformers";

type FeatureExtractionPipeline = Awaited<ReturnType<typeof pipeline>>;
type EmbeddingTensor = {
  data: Float32Array | number[];
};
type EmbeddingExtractor = (
  input: string,
  options: {
    pooling: "mean";
    normalize: boolean;
  }
) => Promise<EmbeddingTensor>;

const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";
const VECTOR_DIMENSION = 384;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor() {
  extractorPromise ??= pipeline("feature-extraction", MODEL_NAME);
  return extractorPromise;
}

export async function generateEmbedding(text: string) {
  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (!normalizedText) {
    throw new Error("Cannot generate an embedding for empty text.");
  }

  const extractor = (await getExtractor()) as unknown as EmbeddingExtractor;
  const output = await extractor(normalizedText, {
    pooling: "mean",
    normalize: true,
  });

  const embedding = Array.from(output.data);

  if (embedding.length !== VECTOR_DIMENSION) {
    throw new Error(
      `Embedding dimension mismatch. Expected ${VECTOR_DIMENSION}, received ${embedding.length}.`
    );
  }

  return embedding;
}

export function toPgVector(embedding: number[]) {
  if (embedding.length !== VECTOR_DIMENSION) {
    throw new Error(
      `Embedding dimension mismatch. Expected ${VECTOR_DIMENSION}, received ${embedding.length}.`
    );
  }

  return `[${embedding.join(",")}]`;
}
