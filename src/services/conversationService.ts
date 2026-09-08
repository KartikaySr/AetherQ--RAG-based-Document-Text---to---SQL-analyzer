import { createClient } from "@/lib/supabase-browser";
const supabase = createClient();
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

function normalizeMode(
  raw: string | null | undefined
): ConversationWorkspaceMode {
  if (raw === "documents") return "documents";
  if (raw === "analytics") return "analytics";
  return "general";
}

function rowToChatMessage(
  row: DbMessageRow
): ChatMessage {
  return {
    id: row.id,
    role: row.role === "user" ? "user" : "assistant",
    content: row.content,
    timestamp: new Date(row.created_at),
    chunks:
      Array.isArray(row.chunks) &&
      row.chunks.length > 0
        ? row.chunks
        : undefined,
  };
}

function isGuestMode() {
  return (
    typeof window !== "undefined" &&
    localStorage.getItem("aetherq_guest_mode") === "true"
  );
}

// Guest Storage Helpers
const GUEST_STORAGE_KEY = "aetherq_guest_conversations";

function getGuestConversations(): LoadedConversation[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return parsed.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  } catch (e) {
    console.error("Error parsing guest conversations", e);
    return [];
  }
}

function saveGuestConversations(conversations: LoadedConversation[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(conversations));
  }
}

export const conversationService = {
  async getConversations(): Promise<
    ConversationSummary[]
  > {
    try {
      let dbConversations: ConversationSummary[] = [];

      if (!isGuestMode()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("conversations")
            .select("id, title, updated_at")
            .eq("user_id", user.id)
            .order("updated_at", {
              ascending: false,
            });

          if (!error && data) {
            dbConversations = data.map((row) => ({
              id: row.id,
              title: row.title,
              updatedAt: new Date(row.updated_at),
            }));
          } else {
            console.error("GET CONVERSATIONS ERROR:", error);
          }
        }
      }

      // Also grab guest conversations to show them in the sidebar
      const guestConvs = getGuestConversations().map(c => ({
        id: c.id,
        title: c.title,
        updatedAt: c.updatedAt
      }));

      // Combine and sort by updated date descending
      const all = [...guestConvs, ...dbConversations];
      all.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return all;
    } catch (err) {
      console.error("GET CONVERSATIONS CATCH:", err);
      return [];
    }
  },

  async getConversation(
    id: string
  ): Promise<LoadedConversation | null> {
    try {
      if (id.startsWith("guest-")) {
        const guestConvs = getGuestConversations();
        return guestConvs.find(c => c.id === id) || null;
      }

      if (isGuestMode()) return null;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const {
        data: conv,
        error: convError,
      } = await supabase
        .from("conversations")
        .select(
          "id, title, mode, created_at, updated_at"
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (convError || !conv) {
        console.error("GET CONVERSATION ERROR:", convError);
        return null;
      }

      const {
        data: msgRows,
        error: msgError,
      } = await supabase
        .from("messages")
        .select(
          "id, role, content, chunks, created_at"
        )
        .eq("conversation_id", id)
        .order("created_at", {
          ascending: true,
        });

      if (msgError) {
        console.error("GET MESSAGES ERROR:", msgError);
        return null;
      }

      const messages = (
        msgRows ?? []
      ).map((r) =>
        rowToChatMessage(
          r as DbMessageRow
        )
      );

      return {
        id: conv.id,
        title: conv.title,
        mode: normalizeMode(conv.mode),
        messages,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
      };
    } catch (err) {
      console.error("GET CONVERSATION CATCH:", err);
      return null;
    }
  },

  async createConversation(title: string, mode: string) {
    try {
      if (isGuestMode()) {
        const now = new Date();
        const id = `guest-${Date.now()}-${crypto.randomUUID()}`;
        const newConv: LoadedConversation = {
          id,
          title,
          mode: normalizeMode(mode),
          messages: [],
          createdAt: now,
          updatedAt: now
        };
        const guestConvs = getGuestConversations();
        saveGuestConversations([newConv, ...guestConvs]);

        return {
          id,
          user_id: "guest",
          title,
          mode,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        };
      }

      console.log("=== CREATE CONVERSATION START ===");
      const authResponse = await supabase.auth.getSession();
      const session = authResponse.data.session;

      if (!session) {
        console.error("NO SESSION FOUND");
        return null;
      }

      const user = session.user;
      const safeMode =
        mode === "documents"
          ? "documents"
          : mode === "analytics"
            ? "general"
            : "general";

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title,
          mode: safeMode,
        })
        .select()
        .single();

      if (error) {
        console.error("SUPABASE INSERT ERROR:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("CREATE CONVERSATION CRASH:", err);
      return null;
    }
  },

  async deleteConversation(
    id: string
  ): Promise<boolean> {
    try {
      if (id.startsWith("guest-")) {
        const guestConvs = getGuestConversations();
        const filtered = guestConvs.filter(c => c.id !== id);
        saveGuestConversations(filtered);
        return true;
      }

      if (isGuestMode()) return true;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      const { error } =
        await supabase
          .from("conversations")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

      if (error) {
        console.error("DELETE CONVERSATION ERROR:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("DELETE CONVERSATION CATCH:", err);
      return false;
    }
  },

  async replaceAllMessages(
    conversationId: string,
    messages: ChatMessage[]
  ): Promise<boolean> {
    try {
      if (conversationId.startsWith("guest-")) {
        const guestConvs = getGuestConversations();
        const convIndex = guestConvs.findIndex(c => c.id === conversationId);
        if (convIndex !== -1) {
          guestConvs[convIndex].messages = messages;
          guestConvs[convIndex].updatedAt = new Date();
          saveGuestConversations(guestConvs);
        }
        return true;
      }

      if (isGuestMode()) return true;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      const {
        data: conv,
        error: convErr,
      } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (convErr || !conv) {
        console.error("VERIFY CONVERSATION ERROR:", convErr);
        return false;
      }

      const { error: delErr } =
        await supabase
          .from("messages")
          .delete()
          .eq("conversation_id", conversationId);

      if (delErr) {
        console.error("DELETE MESSAGES ERROR:", delErr);
        return false;
      }

      const persistable = messages.filter((m) => m.id !== "welcome");

      if (persistable.length === 0) {
        await supabase
          .from("conversations")
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversationId)
          .eq("user_id", user.id);

        return true;
      }

      const rows = persistable.map((m) => ({
        conversation_id: conversationId,
        role: m.role,
        content: m.content,
        chunks:
          m.chunks && m.chunks.length > 0
            ? m.chunks
            : null,
      }));

      const { error: insErr } = await supabase
        .from("messages")
        .insert(rows);

      if (insErr) {
        console.error("INSERT MESSAGES ERROR:", insErr);
        return false;
      }

      await supabase
        .from("conversations")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)
        .eq("user_id", user.id);

      return true;
    } catch (err) {
      console.error("REPLACE MESSAGES CATCH:", err);
      return false;
    }
  },

  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<boolean> {
    try {
      if (conversationId.startsWith("guest-")) {
        const guestConvs = getGuestConversations();
        const convIndex = guestConvs.findIndex(c => c.id === conversationId);
        if (convIndex !== -1) {
          guestConvs[convIndex].title = title;
          guestConvs[convIndex].updatedAt = new Date();
          saveGuestConversations(guestConvs);
        }
        return true;
      }

      if (isGuestMode()) return true;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      const { error } =
        await supabase
          .from("conversations")
          .update({
            title,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversationId)
          .eq("user_id", user.id);

      if (error) {
        console.error("UPDATE TITLE ERROR:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("UPDATE TITLE CATCH:", err);
      return false;
    }
  },
};
