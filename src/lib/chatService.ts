import { createClient } from "@/lib/supabase-browser";

const supabase = createClient();

/**
 * Creates a new conversation for the current authenticated user
 * @returns The created conversation object with id
 */
export async function createConversation() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      title: "New Conversation",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Saves a message to a conversation
 * @param conversationId - The conversation ID
 * @param role - Message role ('user' or 'assistant')
 * @param content - Message content/text
 */
export async function saveMessage(
  conversationId: string,
  role: string,
  content: string
) {
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
  });

  if (error) {
    throw error;
  }
}