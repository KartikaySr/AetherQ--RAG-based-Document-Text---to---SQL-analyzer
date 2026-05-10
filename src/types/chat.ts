export type MessageRole = "user" | "assistant";

/** Warehouse SQL execution surfaced in chat bubbles */
export interface SqlResultPayload {
  sql: string;
  rows: Record<string, unknown>[];
}

export interface RetrievedChunk {
  chunkText: string;
  similarity: number;
  documentName?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  chunks?: RetrievedChunk[];
  sqlResult?: SqlResultPayload;
  isStreaming?: boolean;
}

export type ConversationWorkspaceMode =
  | "general"
  | "documents"
  | "analytics";

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  mode: ConversationWorkspaceMode;
  createdAt: Date;
  updatedAt: Date;
}
