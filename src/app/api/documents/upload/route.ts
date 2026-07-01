import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  createAuthErrorResponse,
  getUserFromRequest,
  isGuestRequestUser,
} from "@/lib/auth-helpers";
import { addGuestDocument } from "@/lib/guestDocuments";
import { getSupabaseServiceClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCUMENTS_BUCKET = "documents";
const DOCUMENTS_TABLE = "documents_metadata";
const MAX_SERVER_FILE_SIZE_MB = Number(process.env.DOCUMENT_MAX_FILE_MB ?? "25");
const MAX_SERVER_FILE_SIZE_BYTES =
  Math.max(5, MAX_SERVER_FILE_SIZE_MB) * 1024 * 1024;
const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".csv", ".json"];

function sanitizeFileName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

function isSupportedDocument(name: string) {
  const lowerName = name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await getUserFromRequest();

    if (!user) {
      return createAuthErrorResponse();
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (!isSupportedDocument(file.name)) {
      return NextResponse.json(
        {
          error: "Upload PDF, DOCX, TXT, Markdown, CSV, or JSON documents only.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SERVER_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Document exceeds the ${MAX_SERVER_FILE_SIZE_MB}MB upload limit.`,
        },
        { status: 413 }
      );
    }

    const storageClient = getSupabaseServiceClient() ?? supabase;
    const safeName = sanitizeFileName(file.name) || "document";
    const documentId = crypto.randomUUID();
    const storagePath = `documents/${user.id}/${Date.now()}-${documentId}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (isGuestRequestUser(user)) {
      const dir = join("/private/tmp", "aetherq-guest-documents", user.id);
      await mkdir(dir, { recursive: true });
      const filePath = join(dir, `${documentId}-${safeName}`);
      await writeFile(filePath, buffer);

      const document = {
        id: documentId,
        name: file.name,
        size: file.size,
        storage_path: `guest://${documentId}/${safeName}`,
        uploaded_at: new Date().toISOString(),
        owner_id: user.id,
        file_path: filePath,
        extraction: null,
        chunks: [],
      };

      addGuestDocument(document);
      return NextResponse.json({ document }, { status: 201 });
    }

    const { error: uploadError } = await storageClient.storage
      .from(DOCUMENTS_BUCKET)
      .upload(storagePath, buffer, {
        cacheControl: "3600",
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data, error } = await storageClient
      .from(DOCUMENTS_TABLE)
      .insert({
        name: file.name,
        size: file.size,
        storage_path: storagePath,
        user_id: user.id,
      })
      .select("id,name,size,storage_path,uploaded_at")
      .single();

    if (error) {
      await storageClient.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ document: data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Document upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
