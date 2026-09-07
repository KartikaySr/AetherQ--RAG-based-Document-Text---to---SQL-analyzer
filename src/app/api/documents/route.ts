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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Since RLS is probably enabled, they'll only see their own docs (if storage_path contains their UUID or if we set up RLS on documents_metadata properly)
    const { data: documents, error } = await supabase
      .from("documents_metadata")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Map to expected format
    const mappedDocuments = documents?.map(doc => ({
      id: doc.id,
      name: doc.name,
      sizeBytes: doc.size,
      status: "uploaded",
      storage_path: doc.storage_path,
      extraction: {
        extraction_status: "completed",
      },
      uploadedAt: doc.uploaded_at,
    })) || [];

    return NextResponse.json({ documents: mappedDocuments });
  } catch (error: any) {
    console.error("Documents fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
