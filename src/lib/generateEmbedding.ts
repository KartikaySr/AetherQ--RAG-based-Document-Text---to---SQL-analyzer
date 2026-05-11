export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction",
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

  if (!Array.isArray(result)) {
    throw new Error("Invalid embedding response");
  }

  // normalize shape
  if (Array.isArray(result[0])) {
    return result[0];
  }

  return result;
}