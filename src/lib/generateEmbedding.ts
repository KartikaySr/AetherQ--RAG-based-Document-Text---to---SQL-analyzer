import { getHuggingFaceEmbeddingUrl } from "./huggingfaceEmbedding";

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const token = process.env.HUGGINGFACE_API_KEY?.trim();
  if (!token) {
    throw new Error("HUGGINGFACE_API_KEY is not configured.");
  }

  const response = await fetch(getHuggingFaceEmbeddingUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `HuggingFace embedding failed: ${errorText}`
    );
  }

  const result = await response.json();

  if (!Array.isArray(result)) {
    throw new Error("Invalid embedding response");
  }

  if (Array.isArray(result[0])) {
    return result[0];
  }

  return result;
}

export function toPgVector(vector: number[]): string {
  return `[${vector.join(",")}]`;
}