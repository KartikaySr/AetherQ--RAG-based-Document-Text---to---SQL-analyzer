import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { HfInference } from "@huggingface/inference";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export const maxDuration = 300; // Increase timeout for processing if possible

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

function splitTextIntoChunks(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload to Supabase Storage
    const storagePath = `documents/${session.user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(`Failed to upload to storage: ${uploadError.message}`);
    }

    // 2. Insert Metadata
    const { data: docData, error: metaError } = await supabase
      .from("documents_metadata")
      .insert({
        name: file.name,
        size: file.size,
        storage_path: storagePath,
        user_id: session.user.id,
      })
      .select("id")
      .single();

    if (metaError || !docData) {
      throw new Error(`Failed to save metadata: ${metaError?.message}`);
    }

    const documentId = docData.id;

    // 3. Extract Text
    let extractedText = "";
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const pdfData = await pdf(buffer);
      extractedText = pdfData.text;
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText || extractedText.trim() === "") {
      throw new Error("No text could be extracted from the document.");
    }

    // 4. Chunk & Embed
    const chunks = splitTextIntoChunks(extractedText);
    
    // Process embeddings in smaller batches to avoid HF limits
    const batchSize = 10;
    const documentChunks = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      const embeddings = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: batch,
      }) as number[][];
      
      for (let j = 0; j < batch.length; j++) {
        documentChunks.push({
          document_id: documentId,
          chunk_text: batch[j],
          chunk_index: i + j,
          embedding: embeddings[j], // array of floats
          user_id: session.user.id,
        });
      }
    }

    // 5. Save chunks to pgvector
    const { error: chunksError } = await supabase
      .from("document_chunks")
      .insert(documentChunks);

    if (chunksError) {
      throw new Error(`Failed to save document chunks: ${chunksError.message}`);
    }

    return NextResponse.json({
      document: {
        id: documentId,
        name: file.name,
        size: file.size,
        storage_path: storagePath,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process document" },
      { status: 500 }
    );
  }
}
