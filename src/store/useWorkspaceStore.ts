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
  chatSessionNonce: number;
  bumpChatSession: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  mode: "general",
  setMode: (mode) => set({ mode }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  selectedDocumentId: null,
  setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),
  chatSessionNonce: 0,
  bumpChatSession: () =>
    set((state) => ({ chatSessionNonce: state.chatSessionNonce + 1 })),
}));
