"use client";

import { Menu, X, Plus, Search, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useToast } from "@/providers/ToastProvider";

export function ChatSidebar() {
  const { sidebarOpen, toggleSidebar, bumpChatSession } = useWorkspaceStore();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Placeholder chat history - in production, load from Supabase
  const recentChats = [
    { id: "1", title: "Machine Learning Basics", date: "Today" },
    { id: "2", title: "Enterprise AI Strategy", date: "Yesterday" },
    { id: "3", title: "Data Analysis Discussion", date: "2 days ago" },
    { id: "4", title: "PDF Document Analysis", date: "3 days ago" },
    { id: "5", title: "Business Intelligence", date: "Last week" },
  ];

  const filteredChats = recentChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            href="/"
            className="flex items-center gap-2 font-semibold text-white hover:opacity-80 transition"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500" />
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
            bumpChatSession();
            addToast("Started a new conversation", "info");
          }}
          className="mb-4 w-full rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 transition flex items-center justify-center gap-2 active:scale-95"
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
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-400/30 focus:bg-white/10 transition"
          />
        </div>

        {/* Chat history */}
        <div className="mb-6 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40 mb-3">
            Recent Chats
          </p>
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left rounded-lg border border-transparent bg-white/[0.03] px-3 py-2.5 text-sm text-white/70 hover:border-white/10 hover:bg-white/5 transition active:scale-95"
              >
                <div className="flex items-start gap-2">
                  <MessageSquare size={14} className="mt-0.5 shrink-0 text-cyan-400" />
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-medium text-white/90">
                      {chat.title}
                    </p>
                    <p className="text-xs text-white/40 mt-1">{chat.date}</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <p className="text-xs text-white/40 py-4 text-center">
              No chats found
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <Link
            href="/analytics"
            className="block rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-100/90 hover:bg-emerald-500/[0.14] transition text-center font-medium"
          >
            📊 Analytics
          </Link>
          <Link
            href="/documents"
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
