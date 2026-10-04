export type ConversationWorkspaceMode = "general" | "sql" | "qa" | "mna" | "audit" | "tax" | "assurance" | "documents" | "analytics" | "dashboard";

export type RetrievedChunk = {
  chunkText: string;
  documentName?: string;
  similarity: number;
};

export type SqlResultPayload = {
  sql: string;
  rows: Record<string, unknown>[];
};

export type ChatMessage = {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
  chunks?: RetrievedChunk[];
  sqlResult?: SqlResultPayload;
  timestamp: number | Date;
};

export type Conversation = {
  id: string;
  title: string;
  mode: ConversationWorkspaceMode;
  messages: ChatMessage[];
  createdAt: number | Date;
  updatedAt?: number | Date;
};
