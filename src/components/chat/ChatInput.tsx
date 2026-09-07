"use client";

import {
  Loader2,
  Send,
  FileText,
  Sparkles,
  ChevronDown,
  BarChart3,
  Mic,
  Image as ImageIcon,
  X,
  Paperclip
} from "lucide-react";
import { useState, useEffect } from "react";
import type { UploadedDocument } from "@/lib/documentTypes";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

type ChatInputProps = {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  documents?: UploadedDocument[];
  selectedDocumentId?: string | null;
  onDocumentChange?: (id: string | null) => void;
  onFileUpload?: (file: File) => Promise<void>;
  isUploadingFile?: boolean;
};

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  documents = [],
  selectedDocumentId = null,
  onDocumentChange,
  onFileUpload,
  isUploadingFile = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [baseInput, setBaseInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { mode, setMode } = useWorkspaceStore();
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition();

  useEffect(() => {
    if (isListening) {
      const base = baseInput.replace(/\s+$/, "");
      setInput(base ? `${base} ${transcript}` : transcript);
    }
  }, [transcript, isListening, baseInput]);

  const handleStartListening = () => {
    setBaseInput(input);
    startListening();
  };

  const handleImageSelect = () => {
    setSelectedImage("https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop");
  };

  const completedDocs = documents.filter(
    (d) => d.extraction?.extraction_status === "completed"
  );

  const activeDoc =
    documents.find((d) => d.id === selectedDocumentId) ?? null;
  const extractionState = activeDoc?.extraction?.extraction_status;

  const handleSend = () => {
    if (input.trim() || selectedImage) {
      const finalInput = selectedImage ? `[Image Attached] ${input.trim()}` : input.trim();
      onSend(finalInput);
      setInput("");
      setBaseInput("");
      setSelectedImage(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileUpload) {
      await onFileUpload(e.target.files[0]);
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
    <div className="space-y-3 rounded-[28px] border-[0.5px] border-white/10 bg-black/55 p-3 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="flex flex-wrap gap-2 px-1">
        <button
          type="button"
          onClick={() => setMode("general")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
            mode === "general"
              ? "border border-emerald-400/30 bg-emerald-500/20 text-emerald-200"
              : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <Sparkles size={12} />
          AI Chat
        </button>
        <button
          type="button"
          onClick={() => setMode("documents")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
            mode === "documents"
              ? "border border-amber-400/30 bg-amber-500/20 text-amber-200"
              : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <FileText size={12} />
          Documents
        </button>
        <button
          type="button"
          onClick={() => setMode("analytics")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
            mode === "analytics"
              ? "border border-emerald-400/35 bg-emerald-500/15 text-emerald-100"
              : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <BarChart3 size={12} />
          SQL Analytics
        </button>
      </div>

      {mode === "documents" && onDocumentChange ? (
        <div className="relative px-1">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Context document
          </label>
          <div className="relative">
            <select
              value={selectedDocumentId ?? ""}
              onChange={(e) =>
                onDocumentChange(e.target.value ? e.target.value : null)
              }
              className="min-h-[40px] w-full appearance-none rounded-[18px] border-[0.5px] border-white/10 bg-white/[0.03] py-2 pl-4 pr-10 text-[13px] text-white outline-none transition focus:border-emerald-400/40 focus:bg-white/[0.05]"
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
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] leading-relaxed text-white/35">
              {completedDocs.length === 0
                ? "Upload documents in the vault and finish extraction before asking."
                : extractionState !== "completed" && selectedDocumentId
                  ? "This file is still ingesting embeddings; pick a completed doc or wait."
                  : "Answers use semantic retrieval across the selected vault document."}
            </p>
            <button 
              type="button"
              onClick={handleImageSelect}
              className="flex items-center gap-1.5 text-[11px] text-white/40 transition hover:text-emerald-400"
            >
              <ImageIcon size={14} />
              Vision
            </button>
          </div>
        </div>
      ) : null}

      {mode === "analytics" ? (
        <div className="px-1">
          <p className="rounded-[16px] border border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-2 text-[10px] font-medium leading-relaxed text-emerald-100/70 tracking-wide">
            Text-to-SQL is validated server-side with read-only execution tied to curated enterprise tables.
          </p>
        </div>
      ) : null}

      <div className="relative flex gap-2">
        {selectedImage && (
          <div className="absolute left-3 top-[-60px] flex items-center gap-2 bg-black/80 backdrop-blur-md rounded-lg p-1 border border-emerald-500/30 z-10">
            <img src={selectedImage} alt="Selected" className="w-10 h-10 object-cover rounded-md" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {isUploadingFile && (
          <div className="absolute left-3 top-[-30px] flex items-center gap-2 bg-emerald-500/10 text-emerald-300 text-xs rounded-full px-3 py-1 border border-emerald-500/20 z-10">
            <Loader2 className="animate-spin" size={12} />
            Uploading document...
          </div>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled || isUploadingFile}
          rows={2}
          className="min-h-[48px] min-w-0 flex-1 resize-none rounded-[20px] border-[0.5px] border-[#D4AF37]/20 bg-[#030604]/60 px-4 py-3 text-[14px] text-[#E5E4E2] outline-none placeholder:text-white/20 focus:border-[#D4AF37]/50 focus:bg-[#030604]/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-300 disabled:opacity-50"
        />
        <label
          className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-[18px] transition-all duration-300 border bg-black/40 text-white/60 border-white/10 hover:border-emerald-400/40 hover:text-white hover:bg-black/60 cursor-pointer"
          title="Upload Document (PDF, Word, TXT)"
        >
          <input 
            type="file" 
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden" 
            disabled={isUploadingFile || isLoading || disabled}
          />
          <Paperclip size={18} />
        </label>
        <button
          type="button"
          onClick={isListening ? stopListening : handleStartListening}
          className={`mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-[18px] transition-all duration-300 border ${
            isListening
              ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse"
              : "bg-black/40 text-white/60 border-white/10 hover:border-amber-400/40 hover:text-white hover:bg-black/60"
          }`}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          <Mic size={18} className={isListening ? "animate-bounce" : ""} />
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || disabled || !input.trim()}
          className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#006039,#D4AF37)] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_10px_rgba(212,175,55,0.3)] border border-[#D4AF37]/40 animate-border-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:animate-none disabled:border-white/10 disabled:shadow-none"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Send size={18} className="-ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
