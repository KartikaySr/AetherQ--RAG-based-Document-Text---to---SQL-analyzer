"use client";

import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useState } from "react";
import { RetrievedChunk } from "@/types/chat";

type CitationDisplayProps = {
  chunks: RetrievedChunk[];
};

export function CitationDisplay({ chunks }: CitationDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!chunks || chunks.length === 0) return null;

  const clampSimilarityPct = (s: number) =>
    Math.round(Math.min(100, Math.max(0, s * 100)));

  const avgSimilarityRaw =
    chunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / chunks.length;

  return (
    <div className="mt-4 space-y-3">
      {/* Status badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-400/20 px-3 py-1 text-xs text-green-300">
          ✓ Semantic retrieval active
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-emerald-600/20 px-3 py-1 text-xs text-blue-300">
          {chunks.length} chunks analyzed
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-400/20 px-3 py-1 text-xs text-amber-300">
          {clampSimilarityPct(avgSimilarityRaw)}% match strength
        </span>
      </div>

      {/* Collapsible sources */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition w-full"
      >
        {isExpanded ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
        <span>View {chunks.length} source{chunks.length !== 1 ? "s" : ""}</span>
      </button>

      {isExpanded && (
        <div className="border-t border-white/10 pt-3 space-y-2">
          {chunks.map((chunk, idx) => (
            <div
              key={`${idx}-${chunk.similarity}-${chunk.chunkText.slice(0, 24)}`}
              className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={12} className="text-white/40 shrink-0" />
                  <span className="font-medium text-white/80 truncate">
                    {chunk.documentName || "Document"}
                  </span>
                </div>
                <span className="inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300 whitespace-nowrap">
                  {clampSimilarityPct(chunk.similarity)}%
                </span>
              </div>
              <p className="text-white/60 leading-relaxed line-clamp-2">
                {chunk.chunkText}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
