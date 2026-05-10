"use client";

import {
  Copy,
  RotateCcw,
  Download,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/providers/ToastProvider";

type MessageActionsProps = {
  content: string;
  onRegenerate?: () => void;
  onExport?: () => void;
  isRegenerating?: boolean;
};

export function MessageActions({
  content,
  onRegenerate,
  onExport,
  isRegenerating = false,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      addToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Could not copy", "error");
    }
  };

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white transition"
        title="Copy to clipboard"
      >
        {copied ? (
          <>
            <Check size={14} />
            Copied
          </>
        ) : (
          <>
            <Copy size={14} />
            Copy
          </>
        )}
      </button>

      {onRegenerate && (
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
          title="Regenerate response"
        >
          <RotateCcw size={14} className={isRegenerating ? "animate-spin" : ""} />
          Regenerate
        </button>
      )}

      {onExport && (
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white transition"
          title="Export message"
        >
          <Download size={14} />
          Export
        </button>
      )}
    </div>
  );
}
