"use client";

import { format } from "date-fns";
import dynamic from "next/dynamic";
import { memo, useCallback, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { CitationDisplay } from "./CitationDisplay";
import { AutoChart } from "./AutoChart";
import { MessageActions } from "./MessageActions";
import { TypingIndicator } from "./TypingIndicator";
import { MultiAgentTerminal } from "./MultiAgentTerminal";
import { PresentationMode } from "@/components/ui/PresentationMode";
import { InteractiveCalculator } from "@/components/ui/InteractiveCalculator";
import { KnowledgeGraph } from "@/components/ui/KnowledgeGraph";
import { BrainCircuit } from "lucide-react";
import { exportService } from "@/services/exportService";
import { useToast } from "@/providers/ToastProvider";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

const MarkdownRenderer = dynamic(
  () => import("./MarkdownRenderer").then((m) => m.MarkdownRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2" aria-hidden>
        <div className="h-3 w-full animate-pulse rounded bg-white/10" />
        <div className="h-3 w-[92%] animate-pulse rounded bg-white/10" />
        <div className="h-3 w-[70%] animate-pulse rounded bg-white/10" />
      </div>
    ),
  }
);

type ChatMessageProps = {
  message: ChatMessageType;
  onRegenerate?: () => Promise<void> | void;
};

function ChatMessageInner({ message, onRegenerate }: ChatMessageProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const { addToast } = useToast();
  const isUser = message.role === "user";
  const isStreaming = Boolean(message.isStreaming && !isUser);

  // Simulated triggers for Wave 3 features
  const showCalculator = !isUser && !isStreaming && message.content.toLowerCase().includes("pricing calculator");
  const showMemoryBadge = !isUser && !isStreaming && message.content.toLowerCase().includes("quarterly metrics");
  const showGraph = !isUser && !isStreaming && message.content.toLowerCase().includes("visualize relationships");

  const handleRegenerate = useCallback(async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  }, [onRegenerate]);

  const handleExport = useCallback(() => {
    try {
      exportService.exportMessage(message, "markdown");
      addToast("Message exported", "success");
    } catch {
      addToast("Failed to export message", "error");
    }
  }, [addToast, message]);

  const showTypingWhileStreaming =
    isStreaming && !message.content.trim().length;

  return (
    <div
      className={`flex gap-4 group ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="h-7 w-7 shrink-0 rounded-lg bg-[linear-gradient(135deg,#006039,#D4AF37)] flex items-center justify-center text-[11px] font-serif text-white font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_0_10px_rgba(212,175,55,0.15)] border border-[#D4AF37]/30">
          A
        </div>
      )}

      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div
          className={`max-w-[min(100%,90vw)] md:max-w-[75%] rounded-[20px] px-4 py-3 break-words overflow-x-auto text-[14px] leading-relaxed ${
            isUser
              ? "ml-auto bg-[linear-gradient(110deg,#006039_0%,#014026_100%)] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_20px_-4px_rgba(0,0,0,0.6)] border border-[#D4AF37]/20"
              : "bg-black/60 border border-[#D4AF37]/10 text-[#E5E4E2] shadow-[inset_0_1px_1px_rgba(212,175,55,0.05),0_8px_20px_-4px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          }`}
        >
          {showMemoryBadge && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-300">
              <BrainCircuit size={12} />
              Recalled: You prefer Quarterly metrics
            </div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : showTypingWhileStreaming ? (
            <MultiAgentTerminal />
          ) : (
            <div className="relative">
              <MarkdownRenderer content={message.content || ""} />
              {isStreaming && (
                <span
                  className="ml-0.5 inline-block h-4 w-1 animate-pulse rounded-sm bg-emerald-400 align-middle"
                  aria-hidden
                />
              )}
            </div>
          )}

          {showCalculator && (
            <InteractiveCalculator />
          )}

          {showGraph && (
            <KnowledgeGraph />
          )}

          {!isUser && !isStreaming && message.chunks && message.chunks.length > 0 && (
            <div className="mt-4">
              <CitationDisplay chunks={message.chunks} />
            </div>
          )}
          {!isUser && !isStreaming && message.sqlResult && (
            <>
              <p className="mt-5 border-t border-[#D4AF37]/10 px-4 pt-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]/60">
                Data Query Execution
              </p>
              <div className="px-4">
                <AutoChart data={message.sqlResult.rows as Record<string, unknown>[]} />
                <pre className="mt-2 max-h-[160px] overflow-auto rounded-lg border border-[#D4AF37]/10 bg-[#030604] p-3 font-mono text-[11px] leading-relaxed text-[#D4AF37]/80 shadow-inner">
                  {message.sqlResult.sql}
                </pre>
                <DataTable
                  rows={message.sqlResult.rows}
                  caption="Executed results"
                />
              </div>
            </>
          )}
        </div>

        <div
          className={`text-[10px] font-medium text-white/30 px-4 ${isUser ? "text-right" : ""}`}
        >
          {format(message.timestamp, "HH:mm")}
        </div>

        {!isUser && !isStreaming && (
          <>
            <div className="px-4">
              <MessageActions
                content={
                  message.content +
                  (message.sqlResult?.sql ? `\n\n\`\`\`sql\n${message.sqlResult.sql}\n\`\`\`` : "")
                }
                onRegenerate={onRegenerate ? handleRegenerate : undefined}
                onExport={handleExport}
                onPresent={() => setIsPresenting(true)}
                isRegenerating={isRegenerating}
              />
            </div>
          </>
        )}
      </div>

      <PresentationMode 
        isOpen={isPresenting}
        onClose={() => setIsPresenting(false)}
        content={
          message.content +
          (message.sqlResult?.sql ? `\n\n\`\`\`sql\n${message.sqlResult.sql}\n\`\`\`` : "")
        }
      />
    </div>
  );
}

export const ChatMessage = memo(ChatMessageInner);
