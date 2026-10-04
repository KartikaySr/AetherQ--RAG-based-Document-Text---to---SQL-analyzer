export type UploadedDocument = {
  id: string;
  name: string;
  size?: number;
  type?: string;
  createdAt?: string | Date;
  status?: string;
  chunk_count?: number;
  storage_path?: string;
  extraction?: DocumentExtraction | {
    extraction_status?: string;
    page_count?: number;
    extracted_text?: string;
  } | null;
};

export type DocumentExtraction = {
  id: string;
  documentId: string;
  text?: string;
  page?: number;
  extraction_status?: string;
  page_count?: number;
  extracted_text?: string;
};
