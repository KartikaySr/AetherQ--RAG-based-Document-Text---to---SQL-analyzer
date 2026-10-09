import { authenticatedClient } from "@/lib/server/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { supabase, user } = await authenticatedClient();
    if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
    if (!user) {
      return NextResponse.json({ documents: [] });
    }

    const { data: documents, error } = await supabase
      .from("documents_metadata")
      .select(`
        *,
        document_chunks ( count )
      `)
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (error) throw error;

    const mappedDocuments = documents?.map((doc: any) => {
      const chunkCount = doc.document_chunks?.[0]?.count ?? 0;
      return {
        id: doc.id,
        name: doc.name,
        sizeBytes: doc.size,
        size: doc.size,
        status: "uploaded",
        storage_path: doc.storage_path,
        chunk_count: chunkCount,
        extraction: {
          extraction_status: chunkCount > 0 ? "completed" : "pending",
          extracted_text: "",
        },
        uploadedAt: doc.uploaded_at,
      };
    }) || [];

    return NextResponse.json({ documents: mappedDocuments });
  } catch (error: any) {
    console.error("Documents fetch error:", error);
    return NextResponse.json({ error: "Documents could not be loaded." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { supabase, user } = await authenticatedClient();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (typeof id !== "string") return Response.json({ error: "Missing document ID." }, { status: 400 });
    const { data: doc, error: lookupError } = await supabase.from("documents_metadata").select("storage_path").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (lookupError) throw lookupError;
    if (!doc) return Response.json({ error: "Document not found." }, { status: 404 });
    if (!doc.storage_path.startsWith(`${user.id}/`)) return Response.json({ error: "Legacy document requires storage migration." }, { status: 409 });
    const { error: storageError } = await supabase.storage.from("documents-private").remove([doc.storage_path]);
    if (storageError) throw storageError;
    const { error: dbError } = await supabase.from("documents_metadata").delete().eq("id", id).eq("user_id", user.id);
    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Documents delete error:", error);
    return NextResponse.json({ error: "Document deletion failed. Please retry." }, { status: 500 });
  }
}
