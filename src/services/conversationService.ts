import { supabase } from "@/lib/supabase";
import type {
  ChatMessage,
  ConversationWorkspaceMode,
  RetrievedChunk,
} from "@/types/chat";

/** Sidebar list row */
export type ConversationSummary = {
  id: string;
  title: string;
  updatedAt: Date;
};

export type LoadedConversation = {
  id: string;
  title: string;
  mode: ConversationWorkspaceMode;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
};

type DbMessageRow = {
  id: string;
  role: string;
  content: string;
  chunks: RetrievedChunk[] | null;
  created_at: string;
};

function normalizeMode(raw: string | null | undefined): ConversationWorkspaceMode {
  if (raw === "documents") return "documents";
  if (raw === "analytics") return "analytics";
  return "general";
}

/** DB constraint may only allow general | documents — map analytics to general for storage. */
function modeForInsert(mode: ConversationWorkspaceMode): "general" | "documents" {
  if (mode === "documents") return "documents";
  return "general";
}

function rowToChatMessage(row: DbMessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role === "user" ? "user" : "assistant",
    content: row.content,
    timestamp: new Date(row.created_at),
    chunks:
      Array.isArray(row.chunks) && row.chunks.length > 0 ? row.chunks : undefined,
  };
}

export const conversationService = {
  async getConversations(): Promise<ConversationSummary[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error || !data) return [];

      return data.map((row) => ({
        id: row.id,
        title: row.title,
        updatedAt: new Date(row.updated_at),
      }));
    } catch {
      return [];
    }
  },

  async getConversation(id: string): Promise<LoadedConversation | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .select("id, title, mode, created_at, updated_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (convError || !conv) return null;

      const { data: msgRows, error: msgError } = await supabase
        .from("messages")
        .select("id, role, content, chunks, created_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (msgError) return null;

      const messages = (msgRows ?? []).map((r) =>
        rowToChatMessage(r as DbMessageRow)
      );

      return {
        id: conv.id,
        title: conv.title,
        mode: normalizeMode(conv.mode),
        messages,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
      };
    } catch {
      return null;
    }
  },

  async createConversation(
    title: string,
    mode: ConversationWorkspaceMode = "general"
  ): Promise<ConversationSummary | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          title,
          user_id: user.id,
          mode: modeForInsert(mode),
        })
        .select("id, title, updated_at")
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        title: data.title,
        updatedAt: new Date(data.updated_at),
      };
    } catch {
      return null;
    }
  },

  async deleteConversation(id: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Replaces all messages for a conversation (excludes UI-only welcome bubble).
   * Requires `messages_delete` RLS policy — see supabase-messages-delete-policy.sql
   */
  async replaceAllMessages(
    conversationId: string,
    messages: ChatMessage[]
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (convErr || !conv) return false;

      const { error: delErr } = await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", conversationId);

      if (delErr) {
        if (process.env.NODE_ENV === "development") {
          console.warn("messages delete (RLS or missing policy):", delErr.message);
        }
        return false;
      }

      const persistable = messages.filter((m) => m.id !== "welcome");
      if (persistable.length === 0) {
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId)
          .eq("user_id", user.id);
        return true;
      }

      const rows = persistable.map((m) => ({
        conversation_id: conversationId,
        role: m.role,
        content: m.content,
        chunks: m.chunks && m.chunks.length > 0 ? m.chunks : null,
      }));

      const { error: insErr } = await supabase.from("messages").insert(rows);

      if (insErr) {
        if (process.env.NODE_ENV === "development") {
          console.warn("messages insert:", insErr.message);
        }
        return false;
      }

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)
        .eq("user_id", user.id);

      return true;
    } catch {
      return false;
    }
  },

  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("conversations")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", conversationId)
        .eq("user_id", user.id);

      return !error;
    } catch {
      return false;
    }
  },
};
