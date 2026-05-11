export interface Conversation {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
  messages?: any[];
}

const STORAGE_KEY = "aetherq_conversations";

function readStorage(): Conversation[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeStorage(conversations: Conversation[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export const conversationService = {
  async getConversations(): Promise<Conversation[]> {
    return readStorage();
  },

  async getConversation(id: string): Promise<Conversation | null> {
    const conversations = readStorage();

    return conversations.find((c) => c.id === id) || null;
  },

  async createConversation(title: string): Promise<Conversation> {
    const conversations = readStorage();

    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
    };

    conversations.unshift(newConversation);

    writeStorage(conversations);

    return newConversation;
  },

  async deleteConversation(id: string): Promise<void> {
    const conversations = readStorage();

    const filtered = conversations.filter((c) => c.id !== id);

    writeStorage(filtered);
  },

  async updateConversation(
    id: string,
    updates: Partial<Conversation>
  ): Promise<void> {
    const conversations = readStorage();

    const updated = conversations.map((conversation) => {
      if (conversation.id !== id) return conversation;

      return {
        ...conversation,
        ...updates,
        updated_at: new Date().toISOString(),
      };
    });

    writeStorage(updated);
  },
};