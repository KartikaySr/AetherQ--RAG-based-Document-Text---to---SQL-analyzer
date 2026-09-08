import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { HfInference } from "@huggingface/inference";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const maxDuration = 60;

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    // Allow guest mode

    const { query, documentId, matchCount = 8, model = "llama-3.1-70b-versatile" } = await req.json();

    if (!query || !documentId) {
      return new Response("Missing query or documentId", { status: 400 });
    }

    // 1. Generate embedding for the query
    const queryEmbedding = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: query,
    });

    // 2. Retrieve relevant chunks from the specific document
    const { data: chunks, error } = await supabase.rpc("match_document_chunks_by_document", {
      document_id: documentId,
      query_embedding: queryEmbedding as number[],
      match_count: matchCount,
    });

    if (error) {
      console.error("Error retrieving context for QA:", error);
    }

    let contextStr = "";
    let sseChunks: any[] = [];

    if (chunks && chunks.length > 0) {
      contextStr = chunks
        .map((chunk: any) => `[From Document: ${chunk.document_name}]\n${chunk.chunk_text}`)
        .join("\n\n");
        
      sseChunks = chunks.map((chunk: any) => ({
        chunkText: chunk.chunk_text,
        similarity: chunk.similarity,
        documentName: chunk.document_name,
      }));
    }

    const systemPrompt = `You are AetherQ Intelligence, an elite Document Analyst AI assistant.
Answer the user's question based strictly on the provided document context. If the answer is not in the context, confidently state that the document does not contain the answer.
Your responses MUST be highly structured. Use rigorous Markdown formatting (tables, bullet points, bold text) to organize the information clearly, luxuriously, and logically.
Maintain a highly professional and authoritative tone akin to a top-tier management consultant.

[DOCUMENT CONTEXT]
${contextStr ? contextStr : "No relevant passages found."}
`;

    const result = streamText({
      model: groq(model),
      system: systemPrompt,
      messages: [{ role: "user", content: query }],
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // First, send the retrieved chunks metadata if any
          if (sseChunks.length > 0) {
            const chunksData = JSON.stringify({ chunks: JSON.stringify(sseChunks) });
            controller.enqueue(new TextEncoder().encode(`data: ${chunksData}\n\n`));
          }

          for await (const chunk of result.textStream) {
            if (chunk) {
              const data = JSON.stringify({ content: chunk });
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err: any) {
          const errorData = JSON.stringify({ error: err.message });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Document QA API Error:", error);
    return new Response(error.message || "Something went wrong", {
      status: 500,
    });
  }
}
