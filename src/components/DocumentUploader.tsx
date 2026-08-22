"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import type { UploadedDocument } from "../lib/documentTypes";
import { useToast } from "../providers/ToastProvider";
export type { UploadedDocument } from "../lib/documentTypes";

type UploadItem = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "success" | "error";
  message?: string;
};

type DocumentUploaderProps = {
  onUploaded: (document: UploadedDocument) => void;
};

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? "25");
const MAX_FILE_SIZE = Math.max(5, MAX_FILE_SIZE_MB) * 1024 * 1024;
const SUPPORTED_MIME_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "text/csv": [".csv"],
  "application/json": [".json"],
} as const;
const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".csv", ".json"];

function isSupportedDocument(file: File) {
  const lowerName = file.name.toLowerCase();

  return (
    Object.keys(SUPPORTED_MIME_TYPES).includes(file.type) ||
    SUPPORTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension))
  );
}

async function uploadDocument(file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/documents/upload", {
    method: "POST",
    body: form,
  });

  const payload = await response.json();

  if (!response.ok || !payload.document) {
    throw new Error(payload.error || "Document metadata could not be saved.");
  }

  return payload.document as UploadedDocument;
}

export default function DocumentUploader({ onUploaded }: DocumentUploaderProps) {
  const { addToast } = useToast();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const id = crypto.randomUUID();

      setNotice(null);
      setItems((current) => [
        {
          id,
          name: file.name,
          progress: 8,
          status: "uploading",
        },
        ...current,
      ]);

      if (!isSupportedDocument(file)) {
        updateItem(id, {
          progress: 100,
          status: "error",
          message:
            "Upload PDF, DOCX, TXT, Markdown, CSV, or JSON documents only.",
        });
        addToast("Unsupported document type.", "error");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        updateItem(id, {
          progress: 100,
          status: "error",
          message: `Document exceeds the ${MAX_FILE_SIZE_MB}MB upload limit.`,
        });
        addToast(`File exceeds ${MAX_FILE_SIZE_MB}MB.`, "error");
        return;
      }

      const progressTimer = window.setInterval(() => {
        setItems((current) =>
          current.map((item) =>
            item.id === id && item.status === "uploading"
              ? {
                  ...item,
                  progress: Math.min(item.progress + 12, 88),
                }
              : item
          )
        );
      }, 400);

      try {
        updateItem(id, {
          progress: 94,
        });

        const document = await uploadDocument(file);

        updateItem(id, {
          progress: 100,
          status: "success",
          message: "Processing document intelligence layer...",
        });
        setNotice(`${file.name} uploaded. Analysis is starting.`);
        addToast(`"${file.name}" uploaded to secure storage—processing started.`, "success");
        onUploaded(document);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Upload failed. Please try again.";

        updateItem(id, {
          progress: 100,
          status: "error",
          message,
        });
        addToast(message, "error");
      } finally {
        window.clearInterval(progressTimer);
      }
    },
    [addToast, onUploaded, updateItem]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        void uploadFile(file);
      });
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      ...SUPPORTED_MIME_TYPES,
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    noClick: true,
    onDrop,
    onDropRejected: (rejections) => {
      const rejected = rejections[0];
      const reason =
        rejected?.errors[0]?.message ||
        `Supported files: PDF, DOCX, TXT, Markdown, CSV, JSON up to ${MAX_FILE_SIZE_MB}MB.`;
      setNotice(reason);
    },
  });

  const activeUploads = useMemo(
    () => items.filter((item) => item.status === "uploading").length,
    [items]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl md:p-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.14),transparent_36%)]" />

      <div className="relative">
        <div
          {...getRootProps()}
          className={`group flex min-h-[300px] cursor-default flex-col items-center justify-center rounded-3xl border border-dashed p-6 text-center transition-all duration-300 md:min-h-[360px] md:p-10 ${
            isDragActive
              ? "border-emerald-300/70 bg-emerald-500/10 shadow-2xl shadow-emerald-500/20"
              : "border-white/15 bg-black/30 hover:border-emerald-400/40 hover:bg-white/[0.045]"
          }`}
        >
          <input {...getInputProps()} />

          <motion.div
            animate={{
              scale: isDragActive ? 1.06 : 1,
              y: isDragActive ? -4 : 0,
            }}
            className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 shadow-lg shadow-emerald-500/10"
          >
            <UploadCloud className="text-emerald-300" size={36} />
          </motion.div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-amber-200">
            <Sparkles size={14} />
            Document Intelligence
          </div>

          <h2 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-4xl">
            Upload enterprise documents for semantic retrieval.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50 md:text-base">
            Drag PDFs, DOCX, and text files here or browse. AetherQ stores them in
            private Supabase Storage and records metadata for the upcoming RAG
            pipeline.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={open}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 px-7 py-4 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] sm:w-auto"
            >
              <FileText size={18} />
              Select Files
            </button>

            <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/55">
              PDF · DOCX · TXT · MD · CSV · JSON · max {MAX_FILE_SIZE_MB}MB
            </div>
          </div>
        </div>

        {(notice || items.length > 0) && (
          <div className="mt-5 space-y-3">
            {notice && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                <CheckCircle2 size={18} />
                {notice}
              </div>
            )}

            {items.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{item.name}</p>
                    <p
                      className={`mt-1 text-sm ${
                        item.status === "error" ? "text-red-300" : "text-white/45"
                      }`}
                    >
                      {item.message ||
                        (item.status === "uploading"
                          ? "Encrypting upload stream..."
                          : "Ready")}
                    </p>
                  </div>

                  {item.status === "uploading" && (
                    <Loader2 className="shrink-0 animate-spin text-emerald-300" />
                  )}

                  {item.status === "success" && (
                    <CheckCircle2 className="shrink-0 text-emerald-300" />
                  )}

                  {item.status === "error" && (
                    <AlertCircle className="shrink-0 text-red-300" />
                  )}
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === "error"
                        ? "bg-red-400"
                        : "bg-gradient-to-r from-emerald-400 to-amber-400"
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeUploads > 0 && (
          <p className="mt-4 text-sm text-white/45">
            {activeUploads} upload{activeUploads === 1 ? "" : "s"} in progress
          </p>
        )}
      </div>
    </motion.section>
  );
}
