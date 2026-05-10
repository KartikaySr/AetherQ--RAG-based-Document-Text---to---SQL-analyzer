"use client";

import {
  Loader2,
  Send,
  FileText,
  Sparkles,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import type { UploadedDocument } from "@/lib/documentTypes";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

type ChatInputProps = {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  documents?: UploadedDocument[];
  selectedDocumentId?: string | null;
  onDocumentChange?: (id: string | null) => void;
};

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  documents = [],
  selectedDocumentId = null,
  onDocumentChange,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const { mode, setMode } = useWorkspaceStore();

  const completedDocs = documents.filter(
    (d) => d.extraction?.extraction_status === "completed"
  );

  const activeDoc =
    documents.find((d) => d.id === selectedDocumentId) ?? null;
  const extractionState = activeDoc?.extraction?.extraction_status;

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const placeholder =
    mode === "documents"
      ? "Ask grounded questions about your document..."
      : mode === "analytics"
        ? "Ask in plain language: revenue by region, headcount, inventory…"
        : "Ask AetherQ anything — General mode can auto-route to SQL or documents.";

  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-black/55 p-4 backdrop-blur-lg">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("general")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
            mode === "general"
              ? "border border-cyan-400/30 bg-cyan-500/20 text-cyan-200"
              : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <Sparkles size={14} />
          AI Chat
        </button>
        <button
          type="button"
          onClick={() => setMode("documents")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
            mode === "documents"
              ? "border border-purple-400/30 bg-purple-500/20 text-purple-200"
              : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <FileText size={14} />
          Documents
        </button>
        <button
          type="button"
          onClick={() => setMode("analytics")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
            mode === "analytics"
              ? "border border-emerald-400/35 bg-emerald-500/15 text-emerald-100"
              : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <BarChart3 size={14} />
          SQL Analytics
        </button>
      </div>

      {mode === "documents" && onDocumentChange ? (
        <div className="relative">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
            Context document
          </label>
          <div className="relative">
            <select
              value={selectedDocumentId ?? ""}
              onChange={(e) =>
                onDocumentChange(e.target.value ? e.target.value : null)
              }
              className="min-h-[44px] w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-4 pr-10 text-sm text-white outline-none transition focus:border-cyan-400/40"
              disabled={documents.length === 0}
              aria-label="Select document context for RAG"
            >
              <option value="">Select a processed document...</option>
              {documents.map((doc) => {
                const ok = doc.extraction?.extraction_status === "completed";
                return (
                  <option key={doc.id} value={doc.id}>
                    {!ok ? "⏳ " : ""}
                    {doc.name}
                  </option>
                );
              })}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-white/40"
              aria-hidden
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-white/35">
            {completedDocs.length === 0
              ? "Upload documents in the vault and finish extraction before asking."
              : extractionState !== "completed" && selectedDocumentId
                ? "This file is still ingesting embeddings; pick a completed doc or wait."
                : "Answers use semantic retrieval across the selected vault document."}
          </p>
        </div>
      ) : null}

      {mode === "analytics" ? (
        <p className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-2 text-[11px] leading-relaxed text-emerald-100/85">
          Text-to-SQL is validated server-side with policy checks, audited query
          logging, and read-only Postgres execution tied to curated enterprise
          tables.
        </p>
      ) : null}

      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          rows={3}
          className="min-h-0 min-w-0 flex-1 resize-none rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 text-white outline-none placeholder:text-white/40 focus:border-cyan-400/40 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || disabled || !input.trim()}
          className="mt-1 flex size-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
}
