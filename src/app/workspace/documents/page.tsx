"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Database, FileSearch, ShieldCheck, Sparkles, Users as UsersIcon, MousePointer2 } from "lucide-react";

import DocumentCard from "@/components/DocumentCard";
import DocumentUploader from "@/components/DocumentUploader";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { useStreamMessage } from "@/hooks/useStreamMessage";
import { useToast } from "@/providers/ToastProvider";
import type { DocumentExtraction, UploadedDocument } from "@/lib/documentTypes";
import type { RetrievedChunk } from "@/types/chat";

function getFileExtensionFromName(name: string) {
  const match = name.toLowerCase().match(/\.([^.]+)$/);
  return match?.[1] ?? "pdf";
}

function DocumentSkeleton() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="h-14 w-14 animate-pulse rounded-2xl bg-white/10" />
      <div className="mt-6 h-5 w-[80%] animate-pulse rounded-full bg-white/10" />
      <div className="mt-3 h-5 w-3/5 animate-pulse rounded-full bg-white/10" />
      <div className="mt-8 h-11 animate-pulse rounded-2xl bg-white/10" />
    </div>
  );
}

export default function DocumentsPage() {
  const { stream } = useStreamMessage();
  const { addToast } = useToast();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const [analysisDocument, setAnalysisDocument] = useState<UploadedDocument | null>(null);
  const [analysisQuery, setAnalysisQuery] = useState("");
  const [analysisAnswer, setAnalysisAnswer] = useState<string | null>(null);
  const [analysisChunks, setAnalysisChunks] = useState<RetrievedChunk[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [showSynthesis, setShowSynthesis] = useState(false);
  const [multiplayerMode, setMultiplayerMode] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/documents", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.error || "Document metadata could not be loaded."
          );
        }

        setDocuments(payload.documents ?? []);
        setError(null);
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Document metadata could not be loaded.";

        setError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  const applyExtraction = useCallback(
    (documentId: string, extraction: DocumentExtraction | null) => {
      setDocuments((current) =>
        current.map((document) =>
          document.id === documentId
            ? {
                ...document,
                extraction,
              }
            : document
        )
      );
    },
    []
  );

  const handleUploaded = useCallback((document: UploadedDocument) => {
    setDocuments((current) => [
      document,
      ...current.filter((item) => item.id !== document.id),
    ]);
  }, []);

  const handleAnalyze = useCallback((document: UploadedDocument) => {
    setAnalysisDocument(document);
    setAnalysisQuery("");
    setAnalysisAnswer(null);
    setAnalysisChunks([]);
    setAnalysisError(null);
  }, []);

  const closeAnalysis = useCallback(() => {
    setAnalysisDocument(null);
    setAnalysisQuery("");
    setAnalysisAnswer(null);
    setAnalysisChunks([]);
    setAnalysisLoading(false);
    setAnalysisError(null);
  }, []);

  const toggleSelectDoc = useCallback((id: string) => {
    setSelectedDocs(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!analysisDocument) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [analysisDocument]);

  const submitAnalysis = useCallback(async () => {
    if (!analysisDocument || !analysisQuery.trim()) return;

    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisChunks([]);
    setAnalysisAnswer("");

    let aggregated = "";
    let retrievedChunks: RetrievedChunk[] = [];

    await stream(
      "/api/documents/qa",
      {
        documentId: analysisDocument.id,
        query: analysisQuery.trim(),
        matchCount: 6,
      },
      {
        onChunk: (chunk: { content?: string; chunks?: string; error?: string }) => {
          if (chunk.content) {
            aggregated += chunk.content.replace(/\\n/g, "\n");
            setAnalysisAnswer(aggregated);
          }
          if (chunk.chunks) {
            try {
              retrievedChunks = JSON.parse(chunk.chunks) as RetrievedChunk[];
            } catch {
              /* citations optional */
            }
          }
        },
        onComplete: () => {
          const trimmed = aggregated.trim();
          if (trimmed) {
            setAnalysisAnswer(trimmed);
            setAnalysisChunks(retrievedChunks);
            addToast("Analysis complete.", "success");
          } else {
            setAnalysisAnswer(null);
            setAnalysisChunks([]);
            addToast(
              "No textual answer returned. Try a different question.",
              "info"
            );
          }
          setAnalysisLoading(false);
        },
        onError: (err: Error) => {
          setAnalysisAnswer(null);
          setAnalysisChunks([]);
          const safe =
            err.message || "Something went wrong while analyzing this document.";
          setAnalysisError(safe);
          addToast(safe, "error");
          setAnalysisLoading(false);
        },
      }
    );
  }, [addToast, analysisDocument, analysisQuery, stream]);

  const handleDelete = useCallback(async (document: UploadedDocument) => {
    const confirmed = window.confirm(`Delete ${document.name} from AetherQ?`);

    if (!confirmed) {
      return;
    }

    const previousDocuments = documents;

    setDeletingId(document.id);
    setError(null);
    setDocuments((current) => current.filter((item) => item.id !== document.id));

    try {
      const response = await fetch("/api/documents", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: document.id,
          storage_path: document.storage_path,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Document could not be deleted.");
      }
      addToast("Document deleted from vault.", "success");
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Document could not be deleted.";

      setDocuments(previousDocuments);
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }, [addToast, documents]);

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white lg:flex-row">

      <main className="relative min-h-[100dvh] min-w-0 flex-1 overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_38%)]" />
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:60px_60px]" />

        <nav
          aria-label="Mobile workspace navigation"
          className="relative z-40 flex gap-3 overflow-x-auto border-b border-white/10 bg-black/85 px-3 py-[max(0.5rem,env(safe-area-inset-top))] pb-2 pt-4 text-xs font-medium uppercase tracking-[0.16em] text-white/65 backdrop-blur-xl [scrollbar-width:none] lg:hidden"
        >
          <Link
            href="/"
            className="whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-[10px] text-white transition hover:bg-white/[0.08]"
          >
            Home
          </Link>
          <Link
            href="/chat"
            className="whitespace-nowrap rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-200 transition hover:bg-emerald-500/15"
          >
            Workspace
          </Link>
          <Link
            href="/analytics"
            className="whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-[10px] text-white transition hover:bg-white/[0.08]"
          >
            Analytics
          </Link>
          <span className="shrink whitespace-nowrap rounded-full border border-amber-400/35 bg-amber-500/15 px-3 py-2 text-[10px] text-amber-100">
            Documents
          </span>
        </nav>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 pt-6 md:px-8 md:py-10">
          <header className="flex flex-col gap-6 border-b border-white/10 pb-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-emerald-200">
                <FileSearch size={14} />
                Knowledge Layer
              </div>

              <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
                Document Intelligence Workspace
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/50 md:text-lg">
                Upload private enterprise documents into AetherQ. This layer stores
                source documents and metadata now, then connects to extraction,
                chunking, embeddings, and semantic retrieval in the next phase.
              </p>
            </div>

            <div className="flex flex-col gap-4 xl:items-end">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setMultiplayerMode(prev => !prev)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${multiplayerMode ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"}`}
                >
                  <UsersIcon size={14} />
                  Multiplayer {multiplayerMode ? "On" : "Off"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[520px]">
                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                  <ShieldCheck className="mb-3 text-emerald-300" size={22} />
                  <p className="text-sm text-white/45">Private bucket</p>
                  <p className="mt-1 font-semibold">Supabase Storage</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                  <Database className="mb-3 text-amber-300" size={22} />
                  <p className="text-sm text-white/45">Metadata index</p>
                  <p className="mt-1 font-semibold">{documents.length} files</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                  <Sparkles className="mb-3 text-pink-300" size={22} />
                  <p className="text-sm text-white/45">RAG status</p>
                  <p className="mt-1 font-semibold">Prepared</p>
                </div>
              </div>
            </div>
          </header>

          <DocumentUploader onUploaded={handleUploaded} />

          <section className="rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl md:p-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-amber-200">
                  Uploaded Documents
                </p>
                <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                  Enterprise Knowledge Vault
                </h2>
              </div>

              {error && (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
              </div>
            ) : documents.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {documents.map((document) => (
                  <div 
                    key={document.id} 
                    className={`relative group/wrapper cursor-pointer transition-all ${selectedDocs.has(document.id) ? "ring-2 ring-amber-500 rounded-3xl" : ""}`}
                    onClick={() => toggleSelectDoc(document.id)}
                  >
                    <div className="absolute top-4 left-4 z-10 flex items-center justify-center">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedDocs.has(document.id) ? "bg-amber-500 border-amber-500" : "border-white/30 bg-black/50"}`}>
                        {selectedDocs.has(document.id) && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 3L4.5 8.5L2 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="pointer-events-auto">
                      <DocumentCard
                        document={document}
                        deleting={deletingId === document.id}
                        actionDisabled={processingIds.has(document.id)}
                        onDelete={handleDelete}
                        onAnalyze={handleAnalyze}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10">
                  <FileSearch className="text-emerald-300" size={34} />
                </div>

                <h3 className="text-2xl font-semibold">No documents uploaded yet</h3>
                <p className="mt-3 max-w-xl text-white/45">
                  Add the first document to begin building AetherQ&apos;s private
                  enterprise knowledge layer.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 text-sm leading-relaxed text-white/45 md:p-6">
            <p className="font-medium text-white/70">Document QA enabled</p>
            <p className="mt-2">
              Upload a PDF or supported document, wait for extraction and embedding,
              then use the Analyze button to ask questions about the document.
              Extracted document context is retrieved and used to answer queries
              through AetherQ&apos;s semantic QA pipeline.
            </p>
          </section>
        </div>

        {analysisDocument ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/70 px-4 py-6 sm:px-6">
            <div className="flex max-h-[calc(100dvh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#071119] p-6 shadow-2xl shadow-black/40">
              <div className="flex shrink-0 items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Analyze {analysisDocument.name}
                  </h2>
                  <p className="mt-2 text-sm text-white/60">
                    Ask a question about the extracted document content.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeAnalysis}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-white/70">
                    Question
                  </label>
                  <textarea
                    value={analysisQuery}
                    onChange={(event) => setAnalysisQuery(event.target.value)}
                    rows={4}
                    placeholder="Ask something specific about the document..."
                    className="w-full rounded-3xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none placeholder:text-white/30"
                  />
                </div>

                {analysisError && (
                  <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {analysisError}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={submitAnalysis}
                    disabled={analysisLoading || !analysisQuery.trim()}
                    className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {analysisLoading ? "Analyzing…" : "Run Analysis"}
                  </button>
                  <button
                    type="button"
                    onClick={closeAnalysis}
                    className="inline-flex w-full items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white transition sm:w-auto"
                  >
                    Dismiss
                  </button>
                </div>

                {analysisAnswer !== null && (
                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-5">
                    <h3 className="text-lg font-semibold text-white">Answer</h3>
                    {analysisLoading && !analysisAnswer.trim() ? (
                      <div className="mt-4 space-y-2" aria-busy="true">
                        <p className="animate-pulse text-sm text-emerald-300/75">
                          Searching enterprise knowledge...
                        </p>
                        <div className="h-3 animate-pulse rounded-full bg-white/10" />
                        <div className="h-3 w-[82%] animate-pulse rounded-full bg-white/10" />
                      </div>
                    ) : null}
                    {analysisAnswer.trim().length > 0 ? (
                      <div className="mt-4 max-h-[42vh] overflow-y-auto overscroll-contain text-sm leading-relaxed text-white/85 md:max-h-[50vh]">
                        <MarkdownRenderer content={analysisAnswer} />
                      </div>
                    ) : null}
                  </div>
                )}

                {analysisChunks.length > 0 && (
                  <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
                    <h3 className="text-lg font-semibold text-white">Context excerpts</h3>
                    <div className="mt-4 space-y-4 text-sm text-white/65">
                      {analysisChunks.map((chunk, index) => (
                        <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="font-semibold text-white/90">
                            Excerpt {index + 1}
                            {chunk.documentName ? (
                              <span className="ml-2 font-normal text-white/55">
                                · {chunk.documentName}
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-2 text-xs text-white/40">
                            similarity: {chunk.similarity.toFixed(3)}
                          </p>
                          <p className="mt-3 leading-relaxed">{chunk.chunkText}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {selectedDocs.size > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-black/80 backdrop-blur-xl border border-amber-500/30 px-6 py-4 rounded-full shadow-[0_8px_32px_rgba(245,158,11,0.2)]"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-black text-xs font-bold">
                {selectedDocs.size}
              </span>
              <span className="text-sm font-medium text-amber-100 uppercase tracking-wider">Documents Selected</span>
            </div>
            <div className="w-px h-6 bg-white/20 mx-2" />
            <button 
              onClick={() => setShowSynthesis(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition"
            >
              <Sparkles size={16} />
              Synthesize Insights
            </button>
          </motion.div>
        )}

        {showSynthesis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 backdrop-blur-sm px-4 py-6 sm:px-6">
            <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-amber-500/20 bg-[#071119] p-8 shadow-2xl shadow-black/40">
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <Sparkles size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Cross-Document Matrix</span>
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-white">
                    Synthesis Report
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSynthesis(false);
                    setSelectedDocs(new Set());
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  Close & Clear
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-white/10 text-white/50 text-xs uppercase tracking-widest font-semibold w-1/4">Metric / Topic</th>
                      {Array.from(selectedDocs).map((id, idx) => {
                        const doc = documents.find(d => d.id === id);
                        return (
                          <th key={id} className="p-4 border-b border-white/10 border-l border-white/5 text-[#E5E4E2] font-semibold text-sm">
                            <div className="truncate w-48" title={doc?.name}>
                              {doc?.name || `Document ${idx + 1}`}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr>
                      <td className="p-4 border-b border-white/5 text-amber-200/70 font-medium">Core Thesis</td>
                      {Array.from(selectedDocs).map(id => (
                        <td key={id} className="p-4 border-b border-white/5 border-l border-white/5 text-white/70">
                          AI-driven automated analysis reduces operational overhead by 40%.
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 text-amber-200/70 font-medium">Risk Factors</td>
                      {Array.from(selectedDocs).map(id => (
                        <td key={id} className="p-4 border-b border-white/5 border-l border-white/5 text-red-300/70">
                          Data privacy concerns; regulatory compliance in EU regions.
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 text-amber-200/70 font-medium">Key Entities</td>
                      {Array.from(selectedDocs).map(id => (
                        <td key={id} className="p-4 border-b border-white/5 border-l border-white/5 text-emerald-300/80 font-mono text-xs">
                          [&quot;QuantumCore&quot;, &quot;Project X&quot;, &quot;Q3 Revenue&quot;]
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 text-amber-200/70 font-medium bg-white/[0.02]">Synthesized Conclusion</td>
                      <td colSpan={selectedDocs.size} className="p-4 border-l border-white/5 text-[#D4AF37] bg-white/[0.02] font-medium italic">
                        The combined documents suggest a strong pivot towards automated compliance monitoring, leveraging QuantumCore to mitigate the identified EU regulatory risks while capturing the 40% operational savings.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {multiplayerMode && (
          <>
            <motion.div
              initial={{ x: "10vw", y: "80vh" }}
              animate={{ 
                x: ["10vw", "40vw", "20vw", "60vw", "10vw"],
                y: ["80vh", "30vh", "50vh", "20vh", "80vh"]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none fixed z-[60] flex flex-col items-center drop-shadow-md"
            >
              <MousePointer2 className="text-emerald-400 fill-emerald-400/20" size={24} />
              <div className="mt-1 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow">
                Alex (Legal)
              </div>
            </motion.div>
            
            <motion.div
              initial={{ x: "80vw", y: "20vh" }}
              animate={{ 
                x: ["80vw", "50vw", "70vw", "30vw", "80vw"],
                y: ["20vh", "60vh", "30vh", "70vh", "20vh"]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none fixed z-[60] flex flex-col items-center drop-shadow-md"
            >
              <MousePointer2 className="text-pink-400 fill-pink-400/20" size={24} />
              <div className="mt-1 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                Sarah (Finance)
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
