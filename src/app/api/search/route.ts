import { NextRequest, NextResponse } from "next/server";

import { generateEmbedding, toPgVector } from "../../../lib/generateEmbedding";
import { getUserFromRequest, createAuthErrorResponse } from "@/lib/auth-helpers";

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

export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await getUserFromRequest();

    if (!user) {
      return createAuthErrorResponse();
    }

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

    const { data, error } = await supabase.rpc("match_document_chunks_for_user", {
      query_embedding: toPgVector(embedding),
      p_user_id: user.id,
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
