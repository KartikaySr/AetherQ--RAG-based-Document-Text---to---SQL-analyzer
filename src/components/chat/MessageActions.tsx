"use client";

import {
  Copy,
  RotateCcw,
  Download,
  Check,
  Volume2,
  VolumeX,
  Presentation,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/providers/ToastProvider";

type MessageActionsProps = {
  content: string;
  onRegenerate?: () => void;
  onExport?: () => void;
  onPresent?: () => void;
  isRegenerating?: boolean;
};

export function MessageActions({
  content,
  onRegenerate,
  onExport,
  onPresent,
  isRegenerating = false,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
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

      {onPresent && (
        <button
          onClick={onPresent}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1.5 text-xs text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:text-[#E6C875] transition"
          title="Enter Presentation Mode"
        >
          <Presentation size={14} />
          Present
        </button>
      )}

      <button
        onClick={handleSpeak}
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition"
        title={isSpeaking ? "Stop playback" : "Play audio"}
      >
        {isSpeaking ? (
          <>
            <VolumeX size={14} />
            Stop
          </>
        ) : (
          <>
            <Volume2 size={14} />
            Play Audio
          </>
        )}
      </button>
    </div>
  );
}
