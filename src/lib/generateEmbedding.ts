const VECTOR_DIMENSION = 384;

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const response = await fetch(
    "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `HuggingFace embedding failed: ${errorText}`
    );
  }

  const result = await response.json();

  if (!Array.isArray(result) || !Array.isArray(result[0])) {
    throw new Error("Invalid embedding response");
  }

  return result[0];
}

export function toPgVector(embedding: number[]): string {
  if (embedding.length !== VECTOR_DIMENSION) {
    throw new Error(
      `Embedding dimension mismatch. Expected ${VECTOR_DIMENSION}, received ${embedding.length}.`
    );
  }

  return `[${embedding.join(",")}]`;
}