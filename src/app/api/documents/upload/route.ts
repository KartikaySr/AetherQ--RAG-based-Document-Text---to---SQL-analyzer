import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/upload-limits";
import { enforceQuota } from "@/lib/server/quota";
import { authenticatedClient } from "@/lib/server/auth";
import { NextResponse } from "next/server";
import { embedTexts } from "@/lib/server/embeddings";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export const maxDuration = 300; // Increase timeout for processing if possible



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
  let cleanup: (() => Promise<void>) | undefined;
  try {
    const { supabase, user } = await authenticatedClient();
    if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
    const quotaResponse = await enforceQuota(supabase);
    if (quotaResponse) return quotaResponse;
    const userId = user.id;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return Response.json({ error: `Files must be between 1 byte and ${MAX_UPLOAD_MB} MB.` }, { status: 413 });
    if (!/\.(pdf|docx|txt|md|csv|json)$/i.test(file.name)) return Response.json({ error: "Supported formats: PDF, DOCX, TXT, MD, CSV, JSON." }, { status: 415 });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload to Supabase Storage
    const storagePath = `${userId}/${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("documents-private")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(`Failed to upload to storage: ${uploadError.message}`);
    }

    let savedDocumentId: string | undefined = undefined;
    cleanup = async () => {
      if (savedDocumentId) {
        const { error } = await supabase.from("documents_metadata").delete().eq("id", savedDocumentId).eq("user_id", userId);
        if (error) console.error("Upload metadata cleanup failed", error.code);
      }
      const { error } = await supabase.storage.from("documents-private").remove([storagePath]);
      if (error) console.error("Upload storage cleanup failed", error.message);
    };
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
    savedDocumentId = documentId;

    // 3. Extract Text
    let extractedText = "";
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const pdfPromise = pdf(buffer);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("PDF parsing timed out")), 10000));

        const pdfData = await Promise.race([pdfPromise, timeoutPromise]) as any;
        extractedText = pdfData.text;
      } catch (err: any) {
        console.error("PDF extraction failed:", err);
        throw new Error(`Failed to extract text from PDF: ${err.message}`);
      }
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText || extractedText.trim() === "") {
      throw new Error("No text could be extracted from the document.");
    }

    if (extractedText.length > 400000) throw new Error("Document is too long. Limit: 400,000 extracted characters.");

    // 4. Chunk & Embed
    const chunks = splitTextIntoChunks(extractedText);

    // Process embeddings in smaller batches to avoid HF limits
    const batchSize = 20;
    const batches = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
      batches.push(chunks.slice(i, i + batchSize));
    }

    const chunkResults = [];
    for (const [batchIndex, batch] of batches.entries()) {
      const embeddings = await embedTexts(batch);
      chunkResults.push(batch.map((text, j) => ({
        document_id: documentId,
        chunk_text: text,
        chunk_index: batchIndex * batchSize + j,
        embedding: embeddings[j],
        user_id: userId,
      })));
    }
    const documentChunks = chunkResults.flat();

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
    await cleanup?.().catch(() => console.error("Upload cleanup could not complete"));
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process document" },
      { status: 500 }
    );
  }
}
