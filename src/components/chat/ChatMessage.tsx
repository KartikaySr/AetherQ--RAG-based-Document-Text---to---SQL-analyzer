"use client";

import { format } from "date-fns";
import dynamic from "next/dynamic";
import { memo, useCallback, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { CitationDisplay } from "./CitationDisplay";
import { MessageActions } from "./MessageActions";
import { TypingIndicator } from "./TypingIndicator";
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
  const { addToast } = useToast();
  const isUser = message.role === "user";
  const isStreaming = Boolean(message.isStreaming && !isUser);

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
        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-xs text-white font-bold">
          A
        </div>
      )}

      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div
          className={`max-w-[min(100%,90vw)] md:max-w-[75%] rounded-3xl px-5 py-4 break-words overflow-x-auto ${
            isUser
              ? "ml-auto bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
              : "bg-white/[0.03] border border-white/10 text-white/90"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-7">{message.content}</p>
          ) : showTypingWhileStreaming ? (
            <TypingIndicator />
          ) : (
            <div className="relative">
              <MarkdownRenderer content={message.content || ""} />
              {isStreaming && (
                <span
                  className="ml-0.5 inline-block h-4 w-1 animate-pulse rounded-sm bg-cyan-400 align-middle"
                  aria-hidden
                />
              )}
            </div>
          )}
          {!isUser && !isStreaming && message.chunks && message.chunks.length > 0 && (
            <div className="mt-4">
              <CitationDisplay chunks={message.chunks} />
            </div>
          )}
          {!isUser && !isStreaming && message.sqlResult && (
            <>
              <p className="mt-6 border-t border-white/10 px-5 pt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/65">
                Generated SQL · read-only warehouse
              </p>
              <div className="px-5">
                <pre className="mt-2 max-h-[200px] overflow-auto rounded-xl border border-cyan-500/15 bg-black/55 p-4 font-mono text-[11px] leading-relaxed text-cyan-100/95">
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
          className={`text-xs text-white/40 px-5 ${isUser ? "text-right" : ""}`}
        >
          {format(message.timestamp, "HH:mm")}
        </div>

        {!isUser && !isStreaming && (
          <>
            <div className="px-5">
              <MessageActions
                content={
                  message.content +
                  (message.sqlResult?.sql ? `\n\n\`\`\`sql\n${message.sqlResult.sql}\n\`\`\`` : "")
                }
                onRegenerate={onRegenerate ? handleRegenerate : undefined}
                onExport={handleExport}
                isRegenerating={isRegenerating}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const ChatMessage = memo(ChatMessageInner);
