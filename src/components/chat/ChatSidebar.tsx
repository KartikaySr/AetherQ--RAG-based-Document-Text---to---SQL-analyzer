"use client";

import { Menu, X, Plus, Search, MessageSquare, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useToast } from "@/providers/ToastProvider";
import {
  conversationService,
  type ConversationSummary,
} from "@/services/conversationService";
import { formatDistanceToNow } from "date-fns";

export function ChatSidebar() {
  const {
    sidebarOpen,
    toggleSidebar,
    bumpChatSession,
    setSelectedConversation,
    selectedConversationId,
    chatSessionNonce,
  } = useWorkspaceStore();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentChats, setRecentChats] = useState<ConversationSummary[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load conversations from Supabase
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoadingChats(true);
        const conversations = await conversationService.getConversations();
        setRecentChats(conversations);
      } catch (error) {
        console.error("Failed to load conversations:", error);
        addToast("Could not load chat history", "error");
      } finally {
        setIsLoadingChats(false);
      }
    };

    loadConversations();
  }, [addToast, chatSessionNonce]);

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(chatId);
      const ok = await conversationService.deleteConversation(chatId);
      if (!ok) {
        addToast("Could not delete conversation", "error");
        return;
      }
      setRecentChats((prev) => prev.filter((chat) => chat.id !== chatId));
      
      // If the deleted chat was selected, select a new one
      if (selectedConversationId === chatId) {
        setSelectedConversation(null);
        bumpChatSession();
      }
      
      addToast("Chat deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      addToast("Failed to delete chat", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectChat = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // On mobile, close sidebar after selection
    if (sidebarOpen) {
      toggleSidebar();
    }
  };

  const filteredChats = recentChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date): string => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed left-4 top-[max(1rem,env(safe-area-inset-top))] z-40 rounded-lg border border-white/10 bg-black/90 p-2 text-white/70 hover:bg-white/10 lg:hidden"
      >
        {sidebarOpen ? (
          <X size={20} />
        ) : (
          <Menu size={20} />
        )}
      </button>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-30 flex w-[min(100%,288px)] flex-col border-r border-white/10 bg-black/95 backdrop-blur-xl p-4 transition-transform duration-300 ease-out lg:relative lg:h-screen lg:w-72 lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/workspace"
            className="flex items-center gap-2 font-semibold text-white hover:opacity-80 transition"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-amber-500" />
            AetherQ
          </Link>
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1 text-white/50 hover:bg-white/10 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* New chat button */}
        <button
          type="button"
          onClick={() => {
            setSelectedConversation(null);
            bumpChatSession();
            addToast("Started a new conversation", "info");
          }}
          className="mb-4 w-full rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus size={16} />
          New Chat
        </button>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-400/30 focus:bg-white/10 transition"
          />
        </div>

        {/* Chat history */}
        <div className="mb-6 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40 mb-3">
            Recent Chats
          </p>
          {isLoadingChats ? (
            <p className="text-xs text-white/40 py-4 text-center">Loading...</p>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative w-full rounded-lg border transition ${
                  selectedConversationId === chat.id
                    ? "border-emerald-400/50 bg-emerald-500/10"
                    : "border-transparent bg-white/[0.03] hover:border-white/10 hover:bg-white/5"
                }`}
              >
                <button
                  onClick={() => handleSelectChat(chat.id)}
                  className="w-full text-left px-3 py-2.5 text-sm text-white/70 active:scale-95"
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-medium text-white/90">
                        {chat.title}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {formatDate(chat.updatedAt)}
                      </p>
                    </div>
                  </div>
                </button>
                {/* Delete button - shows on hover */}
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  disabled={deletingId === chat.id}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/30 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                  title="Delete this chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-white/40 py-4 text-center">
              {searchQuery ? "No chats found" : "No chat history yet"}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <Link
            href="https://github.com/KartikaySr/AetherQ---Rag-Based-Document-Analyzer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-100/90 hover:bg-amber-500/[0.14] transition font-medium"
          >
            <ExternalLink size={16} />
            <span className="hidden sm:inline">Documentation</span>
            <span className="sm:hidden">Docs</span>
          </Link>
          <Link
            href="/workspace/analytics"
            className="block rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-100/90 hover:bg-emerald-500/[0.14] transition text-center font-medium"
          >
            📊 Analytics
          </Link>
          <Link
            href="/workspace/documents"
            className="block rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 transition text-center font-medium"
          >
            📄 Documents
          </Link>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-xs space-y-1">
            <p className="font-medium text-white/70">Mindineers Labs</p>
            <p className="text-white/40">
              Enterprise Intelligence v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
