import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: "", ...options }); },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ documents: [] });
    }

    const { data: documents, error } = await supabase
      .from("documents_metadata")
      .select(`
        *,
        document_chunks ( chunk_text )
      `)
      .order("uploaded_at", { ascending: false });

    if (error) throw error;

    const mappedDocuments = documents?.map((doc: any) => {
      const chunks = doc.document_chunks || [];
      return {
        id: doc.id,
        name: doc.name,
        sizeBytes: doc.size,
        status: "uploaded",
        storage_path: doc.storage_path,
        chunk_count: chunks.length,
        extraction: {
          extraction_status: chunks.length > 0 ? "completed" : "pending",
          extracted_text: chunks[0]?.chunk_text || "",
        },
        uploadedAt: doc.uploaded_at,
      };
    }) || [];

    return NextResponse.json({ documents: mappedDocuments });
  } catch (error: any) {
    console.error("Documents fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch documents" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: "", ...options }); },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, storage_path } = await req.json();
    if (!id || !storage_path) {
      return NextResponse.json({ error: "Missing id or storage_path" }, { status: 400 });
    }

    // Delete from metadata table (cascades to chunks)
    const { error: dbError } = await supabase
      .from("documents_metadata")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    // Delete from storage bucket
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([storage_path]);

    if (storageError) {
      console.error("Failed to delete from storage:", storageError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Documents delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete document" }, { status: 500 });
  }
}
