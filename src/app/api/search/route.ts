import { NextResponse } from "next/server";

import { generateEmbedding, toPgVector } from "../../../lib/generateEmbedding";
import { supabase } from "../../../lib/supabase";

export const runtime = "nodejs";

type SearchRequest = {
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SearchRequest;
    const query = body.query?.replace(/\s+/g, " ").trim();

    if (!query) {
      return NextResponse.json(
        {
          error: "Search query is required.",
        },
        {
          status: 400,
        }
      );
    }

    const matchCount = Math.min(Math.max(body.matchCount ?? 5, 1), 12);
    const embedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: toPgVector(embedding),
      match_count: matchCount,
    });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          results: [],
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      results: ((data ?? []) as MatchDocumentChunkRow[]).map((row) => ({
        chunkText: row.chunk_text,
        similarity: row.similarity,
        documentName: row.document_name,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Semantic search failed.";

    return NextResponse.json(
      {
        error: message,
        results: [],
      },
      {
        status: 500,
      }
    );
  }
}
