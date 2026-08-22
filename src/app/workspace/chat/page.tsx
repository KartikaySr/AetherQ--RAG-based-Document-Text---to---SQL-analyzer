"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useStreamMessage } from "@/hooks/useStreamMessage";
import { classifyGeneralIntent } from "@/lib/intentRouter";
import type { UploadedDocument } from "@/lib/documentTypes";
import { useToast } from "@/providers/ToastProvider";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { conversationService } from "@/services/conversationService";
import type {
  ChatMessage as ChatMessageType,
  RetrievedChunk,
  SqlResultPayload,
} from "@/types/chat";

function createWelcomeMessage(): ChatMessageType {
  return {
    id: "welcome",
    role: "assistant",
    content:
      "# Welcome to AetherQ\n\nYour **Mindineers Labs intelligence mesh** orchestrates:\n\n- **AI Chat** — fast Groq reasoning with optional smart routing\n- **Documents** — vault-grounded RAG with citations\n- **SQL Analytics** — audited Text → SQL → results on curated warehouse tables\n\nPick a discipline with the segmented controls below—the stack keeps each path isolated and governed.",
    timestamp: new Date("2026-05-10T12:00:00.000Z"),
  };
}

const GENERAL_PROMPTS = [
  "Explain machine learning simply",
  "How can AI help my business?",
  "What is enterprise intelligence?",
  "Summarize the latest trends",
  "Create a data analysis plan",
  "Explain artificial intelligence",
];

const DOC_PROMPTS = [
  "Summarize the key obligations.",
  "What timelines or deadlines are mentioned?",
  "List defined terms I should watch.",
];

const SQL_PROMPTS = [
  "Show total revenue grouped by region",
  "Who are the top 5 highest paid employees?",
  "Average freight cost by carrier",
  "Quarterly revenue trend",
];

async function fetchSearchChunks(query: string): Promise<RetrievedChunk[]> {
  try {
    const r = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, matchCount: 10 }),
    });
    const j = (await r.json()) as {
      results?: {
        chunkText: string;
        similarity: number;
        documentName?: string;
      }[];
    };
    if (!r.ok || !j.results) return [];
    return j.results.map((x) => ({
      chunkText: x.chunkText,
      similarity: x.similarity,
      documentName: x.documentName,
    }));
  } catch {
    return [];
  }
}

function ChatWorkspace() {
  const {
    mode,
    setMode,
    selectedDocumentId,
    setSelectedDocumentId,
    selectedConversationId,
    setSelectedConversation,
    pendingGlobalPrompt,
    setPendingGlobalPrompt,
  } = useWorkspaceStore();
  const { stream } = useStreamMessage();
  const { addToast } = useToast();

  const [messages, setMessages] = useState<ChatMessageType[]>([
    createWelcomeMessage(),
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef(messages);
  /** Conversation id used for Supabase persistence (survives first-turn create before store updates). */
  const activeConvRef = useRef<string | null>(null);
  const streamingExtrasRef = useRef<{
    chunks?: RetrievedChunk[];
    sqlResult?: SqlResultPayload;
  }>({});

  useLayoutEffect(() => {
    activeConvRef.current = useWorkspaceStore.getState().selectedConversationId;
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      activeConvRef.current = selectedConversationId;
    }
  }, [selectedConversationId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const id = activeConvRef.current;
    if (!id || isLoading) return;
    const snapshot = messages;
    const t = window.setTimeout(() => {
      void conversationService.replaceAllMessages(id, snapshot);
    }, 900);
    return () => window.clearTimeout(t);
  }, [messages, isLoading]);

  // Load selected conversation from Supabase
  useEffect(() => {
    if (!selectedConversationId) return;
    if (selectedConversationId.startsWith("guest-")) return;

    const loadConversation = async () => {
      try {
        const conversation = await conversationService.getConversation(
          selectedConversationId
        );

        if (!conversation) {
          addToast("Conversation not found or access denied.", "error");
          setMessages([createWelcomeMessage()]);
          setSelectedConversation(null);
          return;
        }

        setMode(conversation.mode);
        if (conversation.messages.length > 0) {
          setMessages(conversation.messages);
        } else {
          setMessages([createWelcomeMessage()]);
        }
      } catch (error) {
        console.error("Failed to load conversation:", error);
        addToast("Failed to load conversation", "error");
        setMessages([createWelcomeMessage()]);
        setSelectedConversation(null);
      }
    };

    loadConversation();
  }, [selectedConversationId, addToast, setSelectedConversation, setMode]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isLoading]);

  useEffect(() => {
    if (mode !== "documents") return;
    const ctrl = new AbortController();
    void fetch("/api/documents", { cache: "no-store", signal: ctrl.signal })
      .then(async (r) => {
        const payload = (await r.json()) as {
          documents?: UploadedDocument[];
        };
        if (r.ok) setDocuments(payload.documents ?? []);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [mode]);

  useEffect(() => {
    if (mode !== "documents" || selectedDocumentId) return;
    const completed = documents.find(
      (d) => d.extraction?.extraction_status === "completed"
    );
    if (completed) setSelectedDocumentId(completed.id);
  }, [documents, mode, selectedDocumentId, setSelectedDocumentId]);

  const handleClearChat = useCallback(() => {
    setMessages([createWelcomeMessage()]);
    setStreamingContent("");
    setIsLoading(false);
    addToast("Chat cleared", "info");
  }, [addToast]);

  const streamGroqChat = useCallback(
    async (
      messageText: string,
      skipUserEcho: boolean,
      enrich?: {
        analyticsContext?: string;
        retrievalContext?: string;
        attach?: {
          chunks?: RetrievedChunk[];
          sqlResult?: SqlResultPayload;
        };
      }
    ) => {
      if (!messageText.trim()) return;

      const trimmed = messageText.trim();
      const userEcho: ChatMessageType = {
        id: `user-${Date.now()}-${crypto.randomUUID()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      if (!skipUserEcho) {
        setMessages((prev) => [...prev, userEcho]);
      }

      streamingExtrasRef.current = enrich?.attach
        ? { ...enrich.attach }
        : {};

      setIsLoading(true);
      setStreamingContent("");

      let fullResponse = "";
      let sseChunks: RetrievedChunk[] = [];

      const payload: Record<string, string> = { message: trimmed };
      if (enrich?.analyticsContext) {
        payload.analyticsContext = enrich.analyticsContext;
      }
      if (enrich?.retrievalContext) {
        payload.retrievalContext = enrich.retrievalContext;
      }

      try {
        await stream("/api/chat", payload, {
          onChunk: (chunk) => {
            if (chunk.content) {
              fullResponse += chunk.content.replace(/\\n/g, "\n");
              setStreamingContent(fullResponse);
            }
            if (chunk.chunks) {
              try {
                sseChunks = JSON.parse(chunk.chunks) as RetrievedChunk[];
              } catch {
                /* ignore malformed citation payloads */
              }
            }
          },
          onComplete: () => {
            const extras = streamingExtrasRef.current;
            streamingExtrasRef.current = {};

            const mergedChunks =
              extras.chunks && extras.chunks.length > 0
                ? extras.chunks
                : sseChunks.length > 0
                  ? sseChunks
                  : undefined;

            if (fullResponse.trim()) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `assist-${Date.now()}-${crypto.randomUUID()}`,
                  role: "assistant",
                  content: fullResponse.trim(),
                  timestamp: new Date(),
                  chunks: mergedChunks,
                  sqlResult: extras.sqlResult,
                },
              ]);
              addToast("Response ready", "success");
            } else if (!skipUserEcho) {
              addToast("No streamed narrative returned.", "error");
            }
            setStreamingContent("");
            setIsLoading(false);
          },
          onError: (error) => {
            streamingExtrasRef.current = {};
            const safe =
              error.message ||
              "We could not complete that request. Please try again.";
            setMessages((prev) => [
              ...prev,
              {
                id: `err-${Date.now()}`,
                role: "assistant",
                content: `**Something went wrong**\n\n${safe}`,
                timestamp: new Date(),
              },
            ]);
            addToast("Request failed", "error");
            setStreamingContent("");
            setIsLoading(false);
          },
        });
      } catch {
        streamingExtrasRef.current = {};
        addToast("Failed to send message", "error");
        setIsLoading(false);
      }
    },
    [addToast, stream]
  );

  const streamDocumentQA = useCallback(
    async (messageText: string, skipUserEcho: boolean) => {
      if (!messageText.trim()) return;
      const trimmed = messageText.trim();

      const userEcho: ChatMessageType = {
        id: `user-${Date.now()}-${crypto.randomUUID()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      if (!skipUserEcho) {
        setMessages((prev) => [...prev, userEcho]);
      }

      setIsLoading(true);
      setStreamingContent("");

      let fullResponse = "";
      let retrievedChunks: RetrievedChunk[] = [];

      try {
        await stream(
          "/api/documents/qa",
          {
            query: trimmed,
            documentId: selectedDocumentId ?? "",
            matchCount: 8,
          },
          {
            onChunk: (chunk) => {
              if (chunk.content) {
                fullResponse += chunk.content.replace(/\\n/g, "\n");
                setStreamingContent(fullResponse);
              }
              if (chunk.chunks) {
                try {
                  retrievedChunks = JSON.parse(chunk.chunks) as RetrievedChunk[];
                } catch {
                  /* ignore */
                }
              }
            },
            onComplete: () => {
              if (fullResponse.trim()) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `assist-${Date.now()}-${crypto.randomUUID()}`,
                    role: "assistant",
                    content: fullResponse.trim(),
                    timestamp: new Date(),
                    chunks:
                      retrievedChunks.length > 0 ? retrievedChunks : undefined,
                  },
                ]);
                addToast("Grounded answer ready", "success");
              } else if (!skipUserEcho) {
                addToast(
                  "No answer returned — try refining your prompt.",
                  "error"
                );
              }
              setStreamingContent("");
              setIsLoading(false);
            },
            onError: (error) => {
              const safe =
                error.message ||
                "Unable to finalize document intelligence request.";
              setMessages((prev) => [
                ...prev,
                {
                  id: `err-${Date.now()}`,
                  role: "assistant",
                  content: `**Document QA issue**\n\n${safe}`,
                  timestamp: new Date(),
                },
              ]);
              addToast("Document QA failed", "error");
              setStreamingContent("");
              setIsLoading(false);
            },
          }
        );
      } catch {
        addToast("Failed to reach document QA service", "error");
        setIsLoading(false);
      }
    },
    [addToast, selectedDocumentId, stream]
  );

  const runWarehouseSql = useCallback(
    async (prompt: string, skipUserEcho: boolean) => {
      if (!prompt.trim()) return;
      const trimmed = prompt.trim();

      const userEcho: ChatMessageType = {
        id: `user-${Date.now()}-${crypto.randomUUID()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      if (!skipUserEcho) {
        setMessages((prev) => [...prev, userEcho]);
      }

      setIsLoading(true);

      try {
        const response = await fetch("/api/sql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
        });
        const data = (await response.json()) as {
          sql?: string;
          rows?: Record<string, unknown>[];
          explanation?: string;
          error?: string;
        };

        const sqlResult: SqlResultPayload | undefined =
          data.sql !== undefined
            ? { sql: data.sql, rows: data.rows ?? [] }
            : undefined;

        const narrative =
          data.explanation ??
          (response.ok
            ? "_No narrative returned._"
            : `**Analytics guardrail**\n\n${data.error ?? "Unable to run SQL analytics."}`);

        setMessages((prev) => [
          ...prev,
          {
            id: `sql-${Date.now()}-${crypto.randomUUID()}`,
            role: "assistant",
            content: narrative,
            timestamp: new Date(),
            sqlResult,
          },
        ]);

        if (response.ok) {
          addToast("Warehouse query complete", "success");
        } else {
          addToast(data.error ?? "SQL analytics rejected", "error");
        }
      } catch {
        addToast("SQL analytics unreachable", "error");
        setMessages((prev) => [
          ...prev,
          {
            id: `sql-err-${Date.now()}`,
            role: "assistant",
            content: "**Warehouse offline**\n\nCould not reach the SQL engine.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  const runHybridAnalyticsDocs = useCallback(
    async (prompt: string, skipUserEcho: boolean) => {
      if (!prompt.trim()) return;

      try {
        const sqlRes = await fetch("/api/sql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: prompt.trim() }),
        });
        const jr = (await sqlRes.json()) as {
          sql?: string;
          rows?: Record<string, unknown>[];
          explanation?: string;
          error?: string;
        };

        const chunks = await fetchSearchChunks(prompt.trim());

        const analyticsContext = sqlRes.ok
          ? `Generated SQL:\n${jr.sql}\n\nExecutive pre-summary:\n${jr.explanation}\n\nRow count: ${jr.rows?.length ?? 0}\nSample JSON rows:\n${JSON.stringify((jr.rows ?? []).slice(0, 18))}`
          : `SQL engine note: ${jr.error ?? "unknown error"}`;

        const retrievalContext =
          chunks.length > 0
            ? chunks
                .map((c, i) => {
                  const pct = (
                    Math.min(Math.max(c.similarity, 0), 1) * 100
                  ).toFixed(0);
                  const title = c.documentName
                    ? `${c.documentName} (${pct}% match)`
                    : `${pct}% match`;
                  return `### Source ${i + 1}: ${title}\n${c.chunkText}`;
                })
                .join("\n\n")
            : "_No overlapping document passages were retrieved for this query._";

        const sqlAttach: SqlResultPayload | undefined = sqlRes.ok
          ? { sql: jr.sql as string, rows: jr.rows ?? [] }
          : undefined;

        await streamGroqChat(prompt.trim(), skipUserEcho, {
          analyticsContext,
          retrievalContext,
          attach: {
            chunks: chunks.length ? chunks : undefined,
            sqlResult: sqlAttach,
          },
        });
      } catch {
        addToast("Hybrid intelligence path failed", "error");
        setIsLoading(false);
      }
    },
    [addToast, streamGroqChat]
  );

  const dispatchUserTurn = useCallback(
    async (messageText: string, skipUserEcho = false) => {
      if (!messageText.trim()) return;
      const trimmed = messageText.trim();

      let convId = selectedConversationId;
      if (!convId) {
        const title =
          trimmed.length > 56 ? `${trimmed.slice(0, 56)}…` : trimmed || "New chat";
        const created = await conversationService.createConversation(title, mode);
        if (!created) {
          const fallbackId = `local-${Date.now()}-${crypto.randomUUID()}`;
          convId = fallbackId;
          activeConvRef.current = convId;
          setSelectedConversation(convId);
          addToast(
            "Saved conversations are unavailable right now, so this chat is continuing temporarily.",
            "info"
          );
        } else {
          convId = created.id;
          activeConvRef.current = convId;
          setSelectedConversation(convId);
        }
      } else {
        activeConvRef.current = convId;
      }

      if (mode === "analytics") {
        await runWarehouseSql(trimmed, skipUserEcho);
        return;
      }

      if (mode === "documents") {
        if (!selectedDocumentId) {
          addToast(
            "Select a processed document before using Document Intelligence.",
            "info"
          );
          return;
        }
        const doc = documents.find((d) => d.id === selectedDocumentId);
        if (doc?.extraction?.extraction_status !== "completed") {
          addToast(
            "That document is still ingesting—pick a completed file.",
            "info"
          );
          return;
        }
        await streamDocumentQA(trimmed, skipUserEcho);
        return;
      }

      const intent = classifyGeneralIntent(trimmed);

      if (intent === "analytics_sql") {
        await runWarehouseSql(trimmed, skipUserEcho);
        return;
      }

      if (intent === "analytics_and_documents") {
        await runHybridAnalyticsDocs(trimmed, skipUserEcho);
        return;
      }

      if (intent === "document_retrieval") {
        const docReady =
          selectedDocumentId &&
          documents.find((d) => d.id === selectedDocumentId)?.extraction
            ?.extraction_status === "completed";

        if (docReady) {
          await streamDocumentQA(trimmed, skipUserEcho);
          return;
        }

        const chunks = await fetchSearchChunks(trimmed);
        const retrievalContext =
          chunks.length > 0
            ? chunks
                .map((c, i) => {
                  const pct = (
                    Math.min(Math.max(c.similarity, 0), 1) * 100
                  ).toFixed(0);
                  const title = c.documentName
                    ? `${c.documentName} (${pct}% match)`
                    : `${pct}% match`;
                  return `### Source ${i + 1}: ${title}\n${c.chunkText}`;
                })
                .join("\n\n")
            : "_No vault passages were retrieved — answer generally and flag the gap._";

        await streamGroqChat(trimmed, skipUserEcho, {
          retrievalContext,
          attach: { chunks: chunks.length ? chunks : undefined },
        });
        return;
      }

      await streamGroqChat(trimmed, skipUserEcho);
    },
    [
      addToast,
      documents,
      mode,
      runHybridAnalyticsDocs,
      runWarehouseSql,
      selectedConversationId,
      selectedDocumentId,
      setSelectedConversation,
      streamDocumentQA,
      streamGroqChat,
    ]
  );

  const handleSendMessage = useCallback(
    (text: string) => {
      void dispatchUserTurn(text, false);
    },
    [dispatchUserTurn]
  );

  // Handle incoming global Copilot commands
  useEffect(() => {
    if (pendingGlobalPrompt && !isLoading) {
      const promptToRun = pendingGlobalPrompt;
      setPendingGlobalPrompt(null);
      
      // Delay slightly to ensure UI is ready
      setTimeout(() => {
        void dispatchUserTurn(promptToRun, false);
      }, 100);
    }
  }, [pendingGlobalPrompt, isLoading, dispatchUserTurn, setPendingGlobalPrompt]);

  const handleRegenerateAt = useCallback(
    async (assistantIndex: number) => {
      const list = messagesRef.current;
      let userContent = "";
      for (let i = assistantIndex - 1; i >= 0; i--) {
        if (list[i]?.role === "user") {
          userContent = list[i].content;
          break;
        }
      }
      if (!userContent) {
        addToast("No prior user utterance found to rerun.", "info");
        return;
      }
      setMessages((prev) => prev.slice(0, assistantIndex));
      await dispatchUserTurn(userContent, true);
    },
    [addToast, dispatchUserTurn]
  );

  const badgeLabel =
    mode === "general"
      ? "✨ AI Chat · smart routing"
      : mode === "documents"
        ? "📄 Document Intelligence"
        : "📊 SQL Analytics";

  const suggested =
    mode === "general"
      ? GENERAL_PROMPTS
      : mode === "documents"
        ? DOC_PROMPTS
        : SQL_PROMPTS;

  const loaderCaption =
    mode === "documents"
      ? "Searching enterprise knowledge..."
      : mode === "analytics"
        ? "Compiling audited warehouse metrics..."
        : "Synthesizing enterprise context…";

  const showingWelcomeSplash =
    messages.length === 1 && !isLoading && streamingContent === "";

  return (
    <div className="flex h-[100dvh] overflow-hidden overscroll-none bg-black text-white">
      <ChatSidebar />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden lg:pb-0">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_40%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:60px_60px] opacity-5" />
        </div>

        <header className="relative z-10 flex items-center justify-between border-b border-[#D4AF37]/10 bg-black/60 px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-xl md:px-6 md:py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h1 className="truncate text-xl font-serif font-bold md:text-2xl luxury-text-gradient">AetherQ</h1>
            <span className="inline-block max-w-[260px] shrink-0 truncate rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] sm:max-w-none">
              {badgeLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6C875] animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]/80">Core Online</span>
              </div>
              <div className="w-[1px] h-3 bg-[#D4AF37]/20" />
              <span className="text-[10px] font-mono text-[#D4AF37]/50">12ms</span>
            </div>
            <button
              type="button"
              onClick={handleClearChat}
              disabled={messages.length <= 1 || isLoading}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#D4AF37]/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/60 transition hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
              title="Clear current chat"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </header>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 pb-[max(10rem,env(safe-area-inset-bottom)+8rem)] pt-6 lg:pb-36">
            {showingWelcomeSplash ? (
              <>
                <div className="mb-12">
                  <ChatMessage message={createWelcomeMessage()} />
                </div>

                <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: "✨",
                      title: "AI Chat",
                      description:
                        "Reasoning, drafting, and smart routing when you stay in General mode.",
                    },
                    {
                      icon: "📄",
                      title: "Documents",
                      description:
                        "Semantic vault search with inline citations and streaming answers.",
                    },
                    {
                      icon: "📊",
                      title: "SQL Analytics",
                      description:
                        "Guarded Text-to-SQL with validation, audit logging, and tabular results.",
                    },
                    {
                      icon: "🛡️",
                      title: "Governed stack",
                      description:
                        "Each path uses production-safe APIs without exposing warehouse credentials client-side.",
                    },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="rounded-2xl border border-[#D4AF37]/10 bg-black/40 p-6 transition hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] backdrop-blur-sm"
                    >
                      <div className="mb-3 text-3xl opacity-80 grayscale">{feature.icon}</div>
                      <h3 className="mb-2 text-base font-serif font-bold text-[#E6C875]">
                        {feature.title}
                      </h3>
                      <p className="text-[13px] leading-relaxed text-white/50">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-white/50">
                    Try a starter prompt:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggested.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:border-emerald-400/30 hover:bg-white/10 hover:text-white active:scale-[0.98]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div key={msg.id} className="mb-8">
                    <ChatMessage
                      message={msg}
                      onRegenerate={
                        msg.role === "assistant" && msg.id !== "welcome"
                          ? () => handleRegenerateAt(index)
                          : undefined
                      }
                    />
                  </div>
                ))}

                {isLoading && streamingContent && (
                  <div className="mb-8">
                    <ChatMessage
                      message={{
                        id: "streaming",
                        role: "assistant",
                        content: streamingContent,
                        timestamp: new Date(),
                        isStreaming: true,
                      }}
                    />
                  </div>
                )}

                {isLoading && !streamingContent && (
                  <div className="mb-8">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 text-xs font-bold text-white">
                        A
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <p className="animate-pulse text-sm text-emerald-200/70">
                          {loaderCaption}
                        </p>
                        <TypingIndicator />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-30 border-t border-white/10 bg-gradient-to-t from-black via-black/95 to-transparent pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
          <div className="mx-auto max-w-4xl px-4 pb-2">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              documents={documents}
              selectedDocumentId={selectedDocumentId}
              onDocumentChange={setSelectedDocumentId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  const chatSessionNonce = useWorkspaceStore((s) => s.chatSessionNonce);
  return <ChatWorkspace key={chatSessionNonce} />;
}
