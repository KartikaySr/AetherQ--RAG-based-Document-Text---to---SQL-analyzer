import { NextResponse } from "next/server";

import { supabase } from "../../../lib/supabase";

type DocumentMetadataRequest = {
  name?: string;
  size?: number;
  storage_path?: string;
};

type DocumentDeleteRequest = {
  id?: string;
  storage_path?: string;
};

const DOCUMENTS_TABLE = "documents_metadata";
const EXTRACTIONS_TABLE = "document_extractions";
const CHUNKS_TABLE = "document_chunks";

export async function GET() {
  try {
    const { data: documents, error: documentsError } = await supabase
      .from(DOCUMENTS_TABLE)
      .select("id,name,size,storage_path,uploaded_at")
      .order("uploaded_at", {
        ascending: false,
      });

    if (documentsError) {
      return NextResponse.json(
        {
          error: documentsError.message,
          documents: [],
        },
        {
          status: 500,
        }
      );
    }

    const documentIds = (documents ?? []).map((document) => document.id);

    if (documentIds.length === 0) {
      return NextResponse.json({
        documents: [],
      });
    }

    const { data: extractions, error: extractionsError } = await supabase
      .from(EXTRACTIONS_TABLE)
      .select(
        "id,document_id,extracted_text,page_count,extraction_status,created_at"
      )
      .in("document_id", documentIds);

    if (extractionsError) {
      return NextResponse.json(
        {
          error: extractionsError.message,
          documents: [],
        },
        {
          status: 500,
        }
      );
    }

    const extractionByDocumentId = new Map(
      (extractions ?? []).map((extraction) => [
        extraction.document_id,
        extraction,
      ])
    );

    const { data: chunks, error: chunksError } = await supabase
      .from(CHUNKS_TABLE)
      .select("document_id")
      .in("document_id", documentIds);

    if (chunksError) {
      return NextResponse.json(
        {
          error: chunksError.message,
          documents: [],
        },
        {
          status: 500,
        }
      );
    }

    const chunkCountByDocumentId = new Map<string, number>();

    for (const chunk of chunks ?? []) {
      chunkCountByDocumentId.set(
        chunk.document_id,
        (chunkCountByDocumentId.get(chunk.document_id) ?? 0) + 1
      );
    }

    return NextResponse.json({
      documents: (documents ?? []).map((document) => ({
        ...document,
        chunk_count: chunkCountByDocumentId.get(document.id) ?? 0,
        extraction: extractionByDocumentId.get(document.id) ?? null,
      })),
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to fetch document metadata.",
        documents: [],
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DocumentMetadataRequest;

    if (!body.name || !body.storage_path || typeof body.size !== "number") {
      return NextResponse.json(
        {
          error: "Missing required document metadata.",
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } = await supabase
      .from(DOCUMENTS_TABLE)
      .insert({
        name: body.name,
        size: body.size,
        storage_path: body.storage_path,
      })
      .select("id,name,size,storage_path,uploaded_at")
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        document: data,
      },
      {
        status: 201,
      }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Unable to save document metadata.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = (await req.json()) as DocumentDeleteRequest;

    if (!body.id || !body.storage_path) {
      return NextResponse.json(
        {
          error: "Missing required document delete metadata.",
        },
        {
          status: 400,
        }
      );
    }

    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([body.storage_path]);

    if (storageError) {
      return NextResponse.json(
        {
          error: storageError.message,
        },
        {
          status: 500,
        }
      );
    }

    const { error: databaseError } = await supabase
      .from(DOCUMENTS_TABLE)
      .delete()
      .eq("id", body.id)
      .eq("storage_path", body.storage_path);

    if (databaseError) {
      return NextResponse.json(
        {
          error: databaseError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to delete document.",
      },
      {
        status: 500,
      }
    );
  }
}
