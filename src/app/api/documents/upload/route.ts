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
    const userId = session?.user?.id || null;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload to Supabase Storage
    const storagePath = `documents/${userId || "guest"}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
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
        user_id: userId,
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
      try {
        console.log("Starting PDF parse for:", file.name);
        const pdfPromise = pdf(buffer);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("PDF parsing timed out")), 10000));
        
        const pdfData = await Promise.race([pdfPromise, timeoutPromise]) as any;
        extractedText = pdfData.text;
        console.log("PDF parsed successfully. Length:", extractedText.length);
      } catch (err: any) {
        console.error("PDF extraction failed:", err);
        throw new Error(`Failed to extract text from PDF: ${err.message}`);
      }
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
    const batchSize = 20; // Increased to 20 to avoid Vercel timeouts
    const documentChunks = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      let embeddings: number[][] = [];
      let retries = 3;
      let delay = 1000;
      
      while (retries > 0) {
        try {
          const result = await hf.featureExtraction({
            model: "sentence-transformers/all-MiniLM-L6-v2",
            inputs: batch,
          });
          
          embeddings = (Array.isArray(result[0]) ? result : [result]) as number[][];
          break;
        } catch (error: any) {
          console.warn(`HF Inference error: ${error?.message || 'Unknown error'}. Retries left: ${retries - 1}`);
          retries -= 1;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
      
      for (let j = 0; j < batch.length; j++) {
        documentChunks.push({
          document_id: documentId,
          chunk_text: batch[j],
          chunk_index: i + j,
          embedding: embeddings[j] || embeddings[0], // fallback
          user_id: userId,
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
        extraction: {
          extraction_status: "completed"
        }
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
