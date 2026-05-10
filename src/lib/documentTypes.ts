export type ExtractionStatus = "pending" | "processing" | "completed" | "failed";

export type DocumentExtraction = {
  id: string;
  document_id: string;
  extracted_text: string;
  page_count: number;
  extraction_status: ExtractionStatus;
  created_at: string;
};

export type UploadedDocument = {
  id: string;
  name: string;
  size: number;
  storage_path: string;
  uploaded_at: string;
  chunk_count?: number;
  extraction?: DocumentExtraction | null;
};
