import type { DocumentExtraction, UploadedDocument } from "@/lib/documentTypes";

type GuestChunk = {
  chunk_id: string;
  document_id: string;
  document_name: string;
  chunk_text: string;
  similarity: number;
  embedding?: number[];
};

type GuestDocumentRecord = UploadedDocument & {
  owner_id: string;
  file_path: string;
  extraction?: DocumentExtraction | null;
  chunks: GuestChunk[];
};

const globalForGuestDocs = globalThis as unknown as {
  __aetherqGuestDocs?: Map<string, GuestDocumentRecord>;
};

const guestDocs = (globalForGuestDocs.__aetherqGuestDocs ??= new Map());

export function addGuestDocument(record: GuestDocumentRecord) {
  guestDocs.set(record.id, record);
}

export function listGuestDocuments(ownerId: string): UploadedDocument[] {
  return Array.from(guestDocs.values())
    .filter((document) => document.owner_id === ownerId)
    .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))
    .map((document) => ({
      id: document.id,
      name: document.name,
      size: document.size,
      storage_path: document.storage_path,
      uploaded_at: document.uploaded_at,
      chunk_count: document.chunks.length,
      extraction: document.extraction ?? null,
    }));
}

export function getGuestDocument(ownerId: string, documentId: string) {
  const document = guestDocs.get(documentId);
  if (!document || document.owner_id !== ownerId) return null;
  return document;
}

export function updateGuestExtraction(
  ownerId: string,
  documentId: string,
  extraction: DocumentExtraction,
  chunks: GuestChunk[]
) {
  const document = getGuestDocument(ownerId, documentId);
  if (!document) return null;

  document.extraction = extraction;
  document.chunks = chunks;
  guestDocs.set(documentId, document);
  return document;
}

export function deleteGuestDocument(ownerId: string, documentId: string) {
  const document = getGuestDocument(ownerId, documentId);
  if (!document) return null;
  guestDocs.delete(documentId);
  return document;
}

export function getGuestChunks(ownerId: string, documentId: string) {
  return getGuestDocument(ownerId, documentId)?.chunks ?? [];
}
