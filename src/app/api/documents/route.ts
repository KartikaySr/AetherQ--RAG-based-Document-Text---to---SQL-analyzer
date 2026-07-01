import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  createAuthErrorResponse,
  isGuestRequestUser,
} from "@/lib/auth-helpers";
import { deleteGuestDocument, listGuestDocuments } from "@/lib/guestDocuments";

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

function isMissingColumn(error: { message?: string; code?: string } | null) {
  return error?.code === "42703" || error?.message?.includes("does not exist");
}

export async function GET() {
  try {
    const { user, supabase } = await getUserFromRequest();

    if (!user) {
      return createAuthErrorResponse();
    }

    if (isGuestRequestUser(user)) {
      return NextResponse.json({
        documents: listGuestDocuments(user.id),
      });
    }

    const { data: documents, error: documentsError } = await supabase
      .from(DOCUMENTS_TABLE)
      .select("id,name,size,storage_path,uploaded_at")
      .eq("user_id", user.id)
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

    let { data: extractions, error: extractionsError } = await supabase
      .from(EXTRACTIONS_TABLE)
      .select(
        "id,document_id,extracted_text,page_count,extraction_status,created_at"
      )
      .eq("user_id", user.id)
      .in("document_id", documentIds);

    if (isMissingColumn(extractionsError)) {
      const retry = await supabase
        .from(EXTRACTIONS_TABLE)
        .select(
          "id,document_id,extracted_text,page_count,extraction_status,created_at"
        )
        .in("document_id", documentIds);
      extractions = retry.data;
      extractionsError = retry.error;
    }

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

    let { data: chunks, error: chunksError } = await supabase
      .from(CHUNKS_TABLE)
      .select("document_id")
      .eq("user_id", user.id)
      .in("document_id", documentIds);

    if (isMissingColumn(chunksError)) {
      const retry = await supabase
        .from(CHUNKS_TABLE)
        .select("document_id")
        .in("document_id", documentIds);
      chunks = retry.data;
      chunksError = retry.error;
    }

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

export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await getUserFromRequest();

    if (!user) {
      return createAuthErrorResponse();
    }

    if (isGuestRequestUser(user)) {
      return NextResponse.json(
        {
          error: "Use /api/documents/upload for guest uploads.",
        },
        { status: 400 }
      );
    }

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
        user_id: user.id,
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

export async function DELETE(req: NextRequest) {
  try {
    const { user, supabase } = await getUserFromRequest();

    if (!user) {
      return createAuthErrorResponse();
    }

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

    if (isGuestRequestUser(user)) {
      const deleted = deleteGuestDocument(user.id, body.id);
      if (!deleted) {
        return createAuthErrorResponse(404);
      }
      return NextResponse.json({ success: true });
    }

    // Verify document belongs to user
    const { data: document } = await supabase
      .from(DOCUMENTS_TABLE)
      .select("id")
      .eq("id", body.id)
      .eq("user_id", user.id)
      .single();

    if (!document) {
      return createAuthErrorResponse(404);
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
      .eq("user_id", user.id)
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
