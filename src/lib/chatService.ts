import { createClient } from "@/lib/supabase-browser";

const supabase = createClient();

/**
 * Creates a new conversation for the current authenticated user
 * @returns The created conversation object with id
 */
export async function createConversation() {
  // Check if user is in guest mode
  const isGuest = localStorage.getItem("aetherq_guest_mode") === "true";
  if (isGuest) {
    // Return a temporary guest conversation object
    return {
      id: `guest-${Date.now()}`,
      user_id: "guest",
      title: "Guest Conversation",
      mode: "general",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

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
  // Check if user is in guest mode - don't save guest messages to DB
  const isGuest = localStorage.getItem("aetherq_guest_mode") === "true";
  if (isGuest || conversationId.startsWith("guest-")) {
    // Messages are not persisted for guests - only kept in memory
    return;
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
  });

  if (error) {
    throw error;
  }
}