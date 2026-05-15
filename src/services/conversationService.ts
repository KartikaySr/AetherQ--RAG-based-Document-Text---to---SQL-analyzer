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

function normalizeMode(
  raw: string | null | undefined
): ConversationWorkspaceMode {
  if (raw === "documents") return "documents";
  if (raw === "analytics") return "analytics";
  return "general";
}

/** DB constraint may only allow general | documents */
function modeForInsert(
  mode: ConversationWorkspaceMode
): "general" | "documents" {
  if (mode === "documents") return "documents";
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

export const conversationService = {
  async getConversations(): Promise<
    ConversationSummary[]
  > {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", {
          ascending: false,
        });

      if (error || !data) {
        console.error(
          "GET CONVERSATIONS ERROR:",
          error
        );

        return [];
      }

      return data.map((row) => ({
        id: row.id,
        title: row.title,
        updatedAt: new Date(
          row.updated_at
        ),
      }));
    } catch (err) {
      console.error(
        "GET CONVERSATIONS CATCH:",
        err
      );

      return [];
    }
  },

  async getConversation(
    id: string
  ): Promise<LoadedConversation | null> {
    try {
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
        console.error(
          "GET CONVERSATION ERROR:",
          convError
        );

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
        console.error(
          "GET MESSAGES ERROR:",
          msgError
        );

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
        mode: normalizeMode(
          conv.mode
        ),
        messages,
        createdAt: new Date(
          conv.created_at
        ),
        updatedAt: new Date(
          conv.updated_at
        ),
      };
    } catch (err) {
      console.error(
        "GET CONVERSATION CATCH:",
        err
      );

      return null;
    }
  },

  async createConversation(title: string, mode: string) {
  try {
    console.log("=== CREATE CONVERSATION START ===");

    const authResponse = await supabase.auth.getSession();

    console.log("FULL SESSION:", authResponse);

    const session = authResponse.data.session;

    if (!session) {
      console.error("NO SESSION FOUND");
      return null;
    }

    const user = session.user;

    console.log("USER:", user);

    const safeMode =
      mode === "documents"
        ? "documents"
        : mode === "analytics"
          ? "general"
          : "general";

    console.log("INSERTING:", {
      user_id: user.id,
      title,
      mode: safeMode,
    });

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

    console.log("SUCCESS:", data);

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
        console.error(
          "DELETE CONVERSATION ERROR:",
          error
        );

        return false;
      }

      return true;
    } catch (err) {
      console.error(
        "DELETE CONVERSATION CATCH:",
        err
      );

      return false;
    }
  },

  async replaceAllMessages(
    conversationId: string,
    messages: ChatMessage[]
  ): Promise<boolean> {
    try {
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
        console.error(
          "VERIFY CONVERSATION ERROR:",
          convErr
        );

        return false;
      }

      const { error: delErr } =
        await supabase
          .from("messages")
          .delete()
          .eq(
            "conversation_id",
            conversationId
          );

      if (delErr) {
        console.error(
          "DELETE MESSAGES ERROR:",
          delErr
        );

        return false;
      }

      const persistable =
        messages.filter(
          (m) => m.id !== "welcome"
        );

      if (
        persistable.length === 0
      ) {
        await supabase
          .from("conversations")
          .update({
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", conversationId)
          .eq("user_id", user.id);

        return true;
      }

      const rows =
        persistable.map((m) => ({
          conversation_id:
            conversationId,
          role: m.role,
          content: m.content,
          chunks:
            m.chunks &&
            m.chunks.length > 0
              ? m.chunks
              : null,
        }));

      const { error: insErr } =
        await supabase
          .from("messages")
          .insert(rows);

      if (insErr) {
        console.error(
          "INSERT MESSAGES ERROR:",
          insErr
        );

        return false;
      }

      await supabase
        .from("conversations")
        .update({
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", conversationId)
        .eq("user_id", user.id);

      return true;
    } catch (err) {
      console.error(
        "REPLACE MESSAGES CATCH:",
        err
      );

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

      const { error } =
        await supabase
          .from("conversations")
          .update({
            title,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", conversationId)
          .eq("user_id", user.id);

      if (error) {
        console.error(
          "UPDATE TITLE ERROR:",
          error
        );

        return false;
      }

      return true;
    } catch (err) {
      console.error(
        "UPDATE TITLE CATCH:",
        err
      );

      return false;
    }
  },
};