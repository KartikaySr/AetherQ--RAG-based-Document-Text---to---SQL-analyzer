import { enforceQuota } from "@/lib/server/quota";
import { authenticatedClient } from "@/lib/server/auth";
import { NextResponse } from "next/server";
import { embedQuery } from "@/lib/server/embeddings";



export async function POST(req: Request) {
  try {
    const { supabase, user } = await authenticatedClient();
    if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
    const quotaResponse = await enforceQuota(supabase);
    if (quotaResponse) return quotaResponse;


    const { query, matchCount = 10 } = await req.json();

    if (typeof query !== "string" || !query.trim() || query.length > 12000 || !Number.isInteger(matchCount) || matchCount < 1 || matchCount > 20) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    // Embed the query
    const queryEmbedding = await embedQuery(query);

    // RPC match_document_chunks
    const { data: chunks, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: queryEmbedding as number[],
      match_count: matchCount,
    });

    if (error) {
      console.error("RPC Error:", error);
      throw error;
    }

    const results = chunks?.map((chunk: any) => ({
      chunkText: chunk.chunk_text,
      similarity: chunk.similarity,
      documentName: chunk.document_name,
    })) || [];

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search is temporarily unavailable." },
      { status: 500 }
    );
  }
}
