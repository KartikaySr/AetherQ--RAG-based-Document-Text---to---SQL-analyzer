import { supabase } from "@/lib/supabase";
import type {
  Conversation,
  ChatMessage as ChatMsg,
  ConversationWorkspaceMode,
  RetrievedChunk,
} from "@/types/chat";

type SupabaseConversationMessageRow = {
  id: string;
  role: ChatMsg["role"];
  content: string;
  chunks: unknown;
  created_at: string;
};

function normalizeMessageRow(msg: SupabaseConversationMessageRow): ChatMsg {
  const rawChunks = msg.chunks;
  const chunks = Array.isArray(rawChunks)
    ? (rawChunks as RetrievedChunk[])
    : undefined;
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    chunks,
    timestamp: new Date(msg.created_at),
  };
}

export const conversationService = {
  async createConversation(
    title: string,
    mode: ConversationWorkspaceMode
  ): Promise<Conversation> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("conversations")
      .insert([
        {
          user_id: user.id,
          title,
          mode,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      mode: data.mode,
      messages: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async getConversations(): Promise<Conversation[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        title,
        mode,
        created_at,
        updated_at,
        messages (
          id,
          role,
          content,
          chunks,
          created_at
        )
      `
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((conv) => ({
      id: conv.id,
      title: conv.title,
      mode: conv.mode,
      messages: (conv.messages || []).map((msg: SupabaseConversationMessageRow) =>
        normalizeMessageRow(msg)
      ),
      createdAt: new Date(conv.created_at),
      updatedAt: new Date(conv.updated_at),
    }));
  },

  async getConversation(id: string): Promise<Conversation> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        title,
        mode,
        created_at,
        updated_at,
        messages (
          id,
          role,
          content,
          chunks,
          created_at
        )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      mode: data.mode,
      messages: (data.messages || []).map((msg: SupabaseConversationMessageRow) =>
        normalizeMessageRow(msg)
      ),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async addMessage(
    conversationId: string,
    message: ChatMsg
  ): Promise<ChatMsg> {
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          chunks: message.chunks || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      role: data.role,
      content: data.content,
      chunks: data.chunks,
      timestamp: new Date(data.created_at),
    };
  },

  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<void> {
    const { error } = await supabase
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (error) throw error;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) throw error;
  },
};