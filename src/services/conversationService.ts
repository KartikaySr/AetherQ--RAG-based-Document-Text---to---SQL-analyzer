import { supabase } from "@/lib/supabase";

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const conversationService = {
  async getConversations(): Promise<Conversation[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // SAFE FALLBACK
      // No auth yet = no conversations
      if (!user) {
        console.warn("No authenticated user found.");
        return [];
      }

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch conversations:", error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Conversation service error:", error);
      return [];
    }
  },

  async createConversation(title: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn("No authenticated user found.");
        return null;
      }

      const { data, error } = await supabase
        .from("conversations")
        .insert([
          {
            title,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Failed to create conversation:", error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async deleteConversation(id: string) {
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Failed to delete conversation:", error.message);
      }
    } catch (error) {
      console.error(error);
    }
  },
};