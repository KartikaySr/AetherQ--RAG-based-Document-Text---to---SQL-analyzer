export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import pdf from "pdf-parse";

import mammoth from "mammoth";

import { supabase } from "@/lib/supabase";

import { chunkDocument } from "@/lib/chunkDocument";

import { generateEmbedding } from "@/lib/generateEmbedding";

const MAX_SERVER_FILE_SIZE_MB = Number(process.env.DOCUMENT_MAX_FILE_MB ?? "25");
const MAX_SERVER_FILE_SIZE_BYTES =
  Math.max(5, MAX_SERVER_FILE_SIZE_MB) * 1024 * 1024;

function inferDocumentType(fileType: string | undefined, storagePath: string) {
  if (fileType) {
    return fileType.toLowerCase();
  }

  const match = storagePath.match(/\.([^.\/\\?#]+)(?:[?#].*)?$/);
  return match?.[1]?.toLowerCase() ?? "pdf";
}

function createExtractionPayload(
  documentId: string,
  extractedText: string,
  pageCount: number,
  status: "completed" | "failed"
) {
  return {
    id: `${status}-${documentId}`,
    document_id: documentId,
    extracted_text: extractedText,
    page_count: pageCount,
    extraction_status: status,
    created_at: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const documentId = body.documentId ?? body.document_id;
    const storagePath = body.storagePath ?? body.storage_path;
    const fileType = body.fileType ?? body.file_type;

    if (!documentId || !storagePath) {

      return NextResponse.json(
        {
          error: "Missing document information",
        },
        {
          status: 400,
        }
      );

    }

    if (process.env.NODE_ENV === "development") {
      console.log("=================================");
      console.log("DOCUMENT EXTRACTION STARTED");
      console.log("DOCUMENT ID:", documentId);
      console.log("STORAGE PATH:", storagePath);
      console.log("FILE TYPE:", fileType);
    }

    /*
    =================================
    DOWNLOAD FILE FROM SUPABASE
    =================================
    */

    const { data: fileData, error: downloadError } =
      await supabase.storage
        .from("documents")
        .download(storagePath);

    if (downloadError || !fileData) {

      console.error(
        "SUPABASE DOWNLOAD FAILED:",
        downloadError
      );

      return NextResponse.json(
        {
          error: "Could not download file",
        },
        {
          status: 500,
        }
      );

    }

    /*
    =================================
    CONVERT TO NODE BUFFER
    =================================
    */

    const arrayBuffer = await fileData.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_SERVER_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File too large for extraction. Maximum supported size is ${MAX_SERVER_FILE_SIZE_MB}MB.`,
        },
        {
          status: 413,
        }
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("BUFFER SIZE:", buffer.length);
    }

    /*
    =================================
    EXTRACT TEXT
    =================================
    */

    let extractedText = "";

    let pageCount = 0;

    const extension = inferDocumentType(
      fileType,
      storagePath
    );

    try {

      /*
      =========================
      PDF EXTRACTION
      =========================
      */

      if (extension === "pdf") {

        if (process.env.NODE_ENV === "development") {
          console.log("PARSING PDF");
        }

        const parsed = await pdf(buffer);

        extractedText = parsed.text || "";

        pageCount = parsed.numpages || 0;

      }

      /*
      =========================
      DOCX EXTRACTION
      =========================
      */

      else if (extension === "docx") {

        if (process.env.NODE_ENV === "development") {
          console.log("PARSING DOCX");
        }

        const result =
          await mammoth.extractRawText({
            buffer,
          });

        extractedText = result.value || "";

        pageCount = 1;

      }

      /*
      =========================
      TEXT-BASED FILES
      =========================
      */

      else if (
        extension === "txt" ||
        extension === "md" ||
        extension === "csv" ||
        extension === "json"
      ) {

        if (process.env.NODE_ENV === "development") {
          console.log("PARSING TEXT FILE");
        }

        extractedText =
          buffer.toString("utf-8");

        pageCount = 1;

      }

      else {

        return NextResponse.json(
          {
            error:
              "Unsupported document type",
          },
          {
            status: 400,
          }
        );

      }

    } catch (extractError) {

      console.error(
        "EXTRACTION FAILED:",
        extractError
      );

      await supabase
        .from("document_extractions")
        .upsert({
          document_id: documentId,
          extracted_text: "",
          page_count: 0,
          extraction_status: "failed",
        });

      return NextResponse.json(
        {
          error:
            "Document extraction failed. If this is a scanned/image-only PDF, run OCR first and then upload the OCR text PDF.",
        },
        {
          status: 500,
        }
      );

    }

    /*
    =================================
    VALIDATE EXTRACTION
    =================================
    */

    extractedText =
      extractedText.trim();

    if (process.env.NODE_ENV === "development") {
      console.log("TEXT LENGTH:", extractedText.length);
      console.log("PAGE COUNT:", pageCount);
    }

    if (!extractedText) {
      const noTextError =
        extension === "pdf"
          ? "No readable text found in PDF. This is usually an image-only/scanned PDF. Run OCR and upload the OCR-enabled PDF."
          : "No readable text found in document";

      return NextResponse.json(
        {
          error: noTextError,
        },
        {
          status: 422,
        }
      );

    }

    /*
    =================================
    SAVE EXTRACTION
    =================================
    */

    const { data: extractionRecord, error: extractionError } =
      await supabase
        .from("document_extractions")
        .upsert({
          document_id: documentId,
          extracted_text: extractedText,
          page_count: pageCount,
          extraction_status: "completed",
        })
        .select(
          "id,document_id,extracted_text,page_count,extraction_status,created_at"
        )
        .single();

    if (extractionError) {

      console.error(
        "EXTRACTION SAVE FAILED:",
        extractionError
      );

    }

    /*
    =================================
    CHUNK DOCUMENT
    =================================
    */

    if (process.env.NODE_ENV === "development") {
      console.log("CHUNKING STARTED");
    }

    const chunks =
      chunkDocument(extractedText);

    if (process.env.NODE_ENV === "development") {
      console.log("TOTAL CHUNKS:", chunks.length);
    }

    /*
    =================================
    DELETE OLD CHUNKS
    =================================
    */

    await supabase
      .from("document_chunks")
      .delete()
      .eq("document_id", documentId);

    /*
    =================================
    GENERATE EMBEDDINGS
    =================================
    */

    for (const chunk of chunks) {

      try {

        if (process.env.NODE_ENV === "development") {
          console.log("GENERATING EMBEDDING:", chunk.chunkIndex);
        }

        const embedding =
          await generateEmbedding(
            chunk.text
          );

        if (process.env.NODE_ENV === "development") {
          console.log("EMBEDDING GENERATED");
        }

        const {
          error: vectorError,
        } = await supabase
          .from("document_chunks")
          .insert({
            document_id: documentId,
            chunk_text: chunk.text,
            chunk_index:
              chunk.chunkIndex,
            embedding,
          });

        if (vectorError) {

          console.error(
            "VECTOR INSERT FAILED:",
            vectorError
          );

        } else if (process.env.NODE_ENV === "development") {
          console.log("VECTOR INSERTED");
        }

      } catch (embeddingError) {

        console.error(
          "EMBEDDING FAILED:",
          embeddingError
        );

      }

    }

    if (process.env.NODE_ENV === "development") {
      console.log("DOCUMENT PROCESSING COMPLETE");
      console.log("=================================");
    }

    const extraction =
      extractionRecord ||
      createExtractionPayload(
        documentId,
        extractedText,
        pageCount,
        "completed"
      );

    return NextResponse.json({
      success: true,
      message: "Document processed successfully",
      extraction,
      pages: pageCount,
      textLength: extractedText.length,
      chunk_count: chunks.length,
    });

  } catch (error) {

    console.error(
      "DOCUMENT PIPELINE FAILED:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Document processing failed",
      },
      {
        status: 500,
      }
    );

  }

}