"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";

import type { UploadedDocument } from "../lib/documentTypes";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

type DocumentCardProps = {
  document: UploadedDocument;
  deleting?: boolean;
  actionDisabled?: boolean;
  onDelete: (document: UploadedDocument) => void;
  onAnalyze?: (document: UploadedDocument) => void;
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** index;

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function getPreview(text?: string) {
  if (!text) return "Text extraction has not completed for this document yet.";

  return text.replace(/\s+/g, " ").trim().slice(0, 240);
}

type PipelineStepProps = {
  label: string;
  state: "done" | "active" | "waiting" | "failed";
};

function PipelineStep({ label, state }: PipelineStepProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${
        state === "done"
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
          : state === "failed"
            ? "border-red-400/20 bg-red-500/10 text-red-200"
            : state === "active"
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
              : "border-white/10 bg-white/[0.03] text-white/35"
      }`}
    >
      {state === "active" ? (
        <Loader2 className="animate-spin" size={13} />
      ) : state === "done" ? (
        <CheckCircle2 size={13} />
      ) : (
        <Circle size={13} />
      )}
      {label}
    </div>
  );
}

export default function DocumentCard({
  document,
  deleting = false,
  actionDisabled = false,
  onDelete,
  onAnalyze,
}: DocumentCardProps) {
  const status = document.extraction?.extraction_status ?? "pending";
  const isProcessing = status === "pending" || status === "processing";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const chunkCount = document.chunk_count ?? 0;
  const isEmbedded = isCompleted && chunkCount > 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:border-emerald-400/30 hover:shadow-emerald-500/10"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative flex h-full flex-col">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
            <FileText className="text-emerald-300" size={28} />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={deleting || actionDisabled || !isCompleted}
              onClick={(e) => {
                e.stopPropagation();
                useWorkspaceStore.getState().setCopilotContext(`Summarize and analyze this document: ${document.name}`);
                useWorkspaceStore.getState().setCopilotOpen(true);
              }}
              aria-label="Ask AI about document"
              title="Ask AI about document"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-200 transition hover:border-amber-400/50 hover:bg-amber-500/20 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={17} />
            </button>
            <button
              type="button"
              disabled={deleting || actionDisabled}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document);
              }}
              aria-label="Delete document"
              title="Delete document"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/45 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Trash2 size={17} />
              )}
            </button>
          </div>
        </div>

        <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-semibold leading-snug text-white">
          {document.name}
        </h3>

        <div className="mt-4 space-y-2 text-sm text-white/45">
          <p>{format(new Date((document as any).uploaded_at || (document as any).uploadedAt || new Date()), "MMM d, yyyy · h:mm a")}</p>
          <p>{formatBytes((document as any).size || (document as any).sizeBytes || 0)}</p>
          {document.extraction?.page_count ? (
            <p>{document.extraction.page_count} pages extracted</p>
          ) : null}
          {chunkCount > 0 ? <p>{chunkCount} semantic chunks indexed</p> : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <PipelineStep label="Uploaded" state="done" />
          <PipelineStep
            label="Extracted"
            state={isFailed ? "failed" : isCompleted ? "done" : "active"}
          />
          <PipelineStep
            label="Embedded"
            state={
              isEmbedded
                ? "done"
                : isFailed
                  ? "failed"
                  : isCompleted
                    ? "active"
                    : "waiting"
            }
          />
          <PipelineStep
            label="Indexed"
            state={
              isEmbedded
                ? "done"
                : isFailed
                  ? "failed"
                  : isCompleted
                    ? "active"
                    : "waiting"
            }
          />
        </div>

        <div
          className={`mt-5 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
            isCompleted
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
              : isFailed
                ? "border-red-400/20 bg-red-500/10 text-red-200"
                : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {isProcessing && <Loader2 className="animate-spin" size={14} />}
          {isCompleted && <CheckCircle2 size={14} />}
          {isFailed && <FileText size={14} />}
          {isCompleted
            ? "Extraction complete"
            : isFailed
              ? "Extraction failed"
            : "Processing document..."}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/35">
            Extracted Preview
          </p>
          <p className="line-clamp-5 text-sm leading-relaxed text-white/55">
            {getPreview(document.extraction?.extracted_text)}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={
              deleting ||
              actionDisabled ||
              !isCompleted ||
              chunkCount === 0
            }
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze?.(document);
            }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100 transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-amber-500/20"
            title={
              isCompleted && chunkCount > 0
                ? "Ask questions about this document"
                : "Wait for extraction and embedding to complete"
            }
          >
            <Sparkles size={16} />
            Analyze
          </button>
        </div>
      </div>
    </motion.article>
  );
}
