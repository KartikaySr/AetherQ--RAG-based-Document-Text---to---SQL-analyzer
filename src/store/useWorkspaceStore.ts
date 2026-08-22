import { create } from "zustand";

import type { ConversationWorkspaceMode } from "@/types/chat";

export type WorkspaceMode = ConversationWorkspaceMode;

interface WorkspaceState {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  selectedDocumentId: string | null;
  setSelectedDocumentId: (id: string | null) => void;
  selectedConversationId: string | null;
  setSelectedConversation: (id: string | null) => void;
  chatSessionNonce: number;
  bumpChatSession: () => void;
  
  // AetherQ 2.0: Global Copilot
  isCopilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  copilotContext: string | null;
  setCopilotContext: (context: string | null) => void;
  pendingGlobalPrompt: string | null;
  setPendingGlobalPrompt: (prompt: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  mode: "general",
  setMode: (mode) => set({ mode }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  selectedDocumentId: null,
  setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),
  selectedConversationId: null,
  setSelectedConversation: (id) => set({ selectedConversationId: id }),
  chatSessionNonce: 0,
  bumpChatSession: () =>
    set((state) => ({ chatSessionNonce: state.chatSessionNonce + 1 })),
    
  isCopilotOpen: false,
  setCopilotOpen: (open) => set({ isCopilotOpen: open }),
  copilotContext: null,
  setCopilotContext: (context) => set({ copilotContext: context }),
  pendingGlobalPrompt: null,
  setPendingGlobalPrompt: (prompt) => set({ pendingGlobalPrompt: prompt }),
}));
