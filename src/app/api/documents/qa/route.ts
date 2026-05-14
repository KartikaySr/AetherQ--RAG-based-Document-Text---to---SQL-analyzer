export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { generateEmbedding, toPgVector } from "@/lib/generateEmbedding";
import { GROQ_CHAT_MODEL } from "@/lib/groqModel";

type QARequest = {
  documentId?: string;
  document_id?: string;
  query?: string;
  matchCount?: number;
};

type MatchDocumentChunkRow = {
  chunk_id: string;
  document_id: string;
  document_name: string;
  chunk_text: string;
  similarity: number;
};

function parseEmbedding(value: unknown): number[] | null {
  if (Array.isArray(value)) {
    return value.map((item) => Number(item));
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => Number(item));
      }
    } catch {
      return null;
    }
  }

  return null;
}

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  const normA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const normB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  return normA === 0 || normB === 0 ? 0 : dot / (normA * normB);
}

function formatChunks(rows: MatchDocumentChunkRow[]) {
  return rows.map((row) => ({
    chunkText: row.chunk_text,
    similarity: row.similarity,
    documentName: row.document_name || undefined,
  }));
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI assistant is temporarily unavailable." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as QARequest;
    const documentId = body.documentId ?? body.document_id;
    const query = body.query?.replace(/\s+/g, " ").trim();

    if (!documentId) {
      return NextResponse.json(
        {
          error: "documentId is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!query) {
      return NextResponse.json(
        {
          error: "query is required.",
        },
        {
          status: 400,
        }
      );
    }

    const matchCount = Math.min(Math.max(body.matchCount ?? 5, 1), 10);
    const embedding = await generateEmbedding(query);
    const queryEmbedding = toPgVector(embedding);
    const { supabase } = await import("@/lib/supabase");

    let results: MatchDocumentChunkRow[] = [];
    let dataError: Error | null = null;

    const rpcResponse = await supabase.rpc("match_document_chunks_by_document", {
      document_id: documentId,
      query_embedding: queryEmbedding,
      match_count: matchCount,
    });

    if (rpcResponse.error) {
      if (rpcResponse.error.message?.includes("match_document_chunks_by_document")) {
        const fallback = await supabase
          .from("document_chunks")
          .select("chunk_text,embedding")
          .eq("document_id", documentId);

        if (fallback.error || !fallback.data) {
          return NextResponse.json(
            {
              error:
                fallback.error?.message ||
                "Unable to load document context for analysis.",
            },
            {
              status: 500,
            }
          );
        }

        const fallbackRows = (fallback.data as Array<{
          chunk_text: string;
          embedding: unknown;
        }>)
          .map((row) => ({
            chunk_text: row.chunk_text,
            embedding: parseEmbedding(row.embedding) ?? [],
          }))
          .filter((row) => row.embedding.length === embedding.length)
          .map((row) => ({
            chunkText: row.chunk_text,
            similarity: cosineSimilarity(embedding, row.embedding),
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, matchCount)
          .map((row) => ({
            chunk_id: "",
            document_id: documentId,
            document_name: "",
            chunk_text: row.chunkText,
            similarity: row.similarity,
          }));

        results = fallbackRows;
      } else {
        dataError = rpcResponse.error;
      }
    } else {
      results = (rpcResponse.data ?? []) as MatchDocumentChunkRow[];
    }

    if (dataError) {
      return NextResponse.json(
        {
          error: dataError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (results.length === 0) {
      return NextResponse.json(
        {
          error: "No extracted content available for this document.",
        },
        {
          status: 404,
        }
      );
    }

    const context = results
      .map(
        (row, index) =>
          `Excerpt ${index + 1} (similarity: ${row.similarity.toFixed(3)}):\n${row.chunk_text}`
      )
      .join("\n\n");

    const prompt = `Use the document excerpts below to answer the user question. Answer only from the provided text, and if the information is not present, say you do not know.\n\n${context}\n\nQuestion: ${query}\nAnswer:`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              },
              body: JSON.stringify({
                model: GROQ_CHAT_MODEL,
                messages: [
                  {
                    role: "system",
                    content:
                      "You are AetherQ, a professional enterprise AI assistant. Use only the provided document context to answer the user. If you cannot answer from the content, say that the information is not available.",
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                temperature: 0.2,
                max_tokens: 500,
                stream: true,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Groq API error: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("No response body");
          }

          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);

                if (data === "[DONE]") {
                  const chunksJson = JSON.stringify(formatChunks(results));
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ chunks: chunksJson })}\n\n`
                    )
                  );
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || "";

                  if (content) {
                    const token = content.replace(/\n/g, "\\n");
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ content: token })}\n\n`
                      )
                    );
                  }
                } catch {
                  // Skip parsing errors
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Document QA stream error:", error);
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error:
                  "Something went wrong while analyzing the document. Please try again.",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Document QA request failed.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
