"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  Database,
  FileText,
  ArrowRight,
  Shield,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import {
  conversationService,
  type ConversationSummary,
} from "@/services/conversationService";

function greetingForHour(h: number): string {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function WorkspacePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ documentCount: 0, conversationCount: 0 });
  const [recent, setRecent] = useState<ConversationSummary[]>([]);

  const displayName = useMemo(() => {
    const meta = user?.user_metadata as { full_name?: string } | undefined;
    if (meta?.full_name && typeof meta.full_name === "string") {
      return meta.full_name.split(" ")[0] ?? user?.email?.split("@")[0];
    }
    return user?.email?.split("@")[0] ?? "there";
  }, [user]);

  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);

  useEffect(() => {
    const ctrl = new AbortController();
    void fetch("/api/workspace/stats", {
      credentials: "include",
      signal: ctrl.signal,
    })
      .then(async (r) => {
        const j = (await r.json()) as {
          documentCount?: number;
          conversationCount?: number;
        };
        if (r.ok) {
          setStats({
            documentCount: j.documentCount ?? 0,
            conversationCount: j.conversationCount ?? 0,
          });
        }
      })
      .catch(() => {});

    void conversationService.getConversations().then((list) => {
      setRecent(list.slice(0, 5));
    });

    return () => ctrl.abort();
  }, []);

  const features = [
    {
      icon: BrainCircuit,
      title: "AI Workspace",
      description:
        "Groq-powered chat with routing for documents, SQL analytics, and general reasoning.",
      href: "/workspace/chat",
      color: "from-cyan-500 to-blue-500",
      border: "border-cyan-500/20",
    },
    {
      icon: Database,
      title: "Enterprise Analytics",
      description:
        "Natural language to validated SQL on curated warehouse tables with audit logging.",
      href: "/workspace/analytics",
      color: "from-purple-500 to-pink-500",
      border: "border-purple-500/20",
    },
    {
      icon: FileText,
      title: "Document Intelligence",
      description:
        "Private vault per account: upload, embed, and query your files with citations.",
      href: "/workspace/documents",
      color: "from-pink-500 to-orange-500",
      border: "border-pink-500/20",
    },
  ];

  const initial =
    (user?.email?.[0] ?? "?").toUpperCase() +
    (user?.email?.split("@")[0]?.slice(-1)?.toUpperCase() ?? "");

  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden relative">
      <div className="absolute inset-0">
        <motion.div
          animate={{ x: [0, 80, -40, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[380px] md:w-[520px] h-[380px] md:h-[520px] bg-cyan-500/10 rounded-full blur-[90px]"
        />
        <motion.div
          animate={{ x: [0, -60, 50, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[380px] md:w-[520px] h-[380px] md:h-[520px] bg-purple-500/10 rounded-full blur-[90px]"
        />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200/90">
              <Sparkles className="w-3.5 h-3.5" />
              Enterprise Intelligence Mesh
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
              {greeting},{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {displayName}
              </span>
            </h1>
            <p className="text-lg text-white/55 leading-relaxed">
              Your workspace is isolated by account: documents, embeddings, and
              chat history stay private. Use the modules below to analyze data,
              query files, or collaborate with the AI assistant.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-6 py-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 text-lg font-bold text-white shadow-lg shadow-cyan-500/20">
              {initial.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-white/40">
                Signed in
              </p>
              <p className="truncate text-sm font-medium text-white">
                {user?.email ?? "—"}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400/90">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                Row-level security on your data plane
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-white/45">
              Vault documents
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {stats.documentCount}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-white/45">
              Saved conversations
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {stats.conversationCount}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-white/45">
              Isolation
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">Per user</p>
            <p className="mt-1 text-xs text-white/45">RLS + scoped APIs</p>
          </motion.div>
        </div>

        {recent.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
                Recent conversations
              </h2>
              <Link
                href="/workspace/chat"
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
              >
                Open chat →
              </Link>
            </div>
            <ul className="divide-y divide-white/10">
              {recent.map((c) => (
                <li key={c.id}>
                  <Link
                    href="/workspace/chat"
                    className="flex items-center gap-3 py-3 text-sm text-white/75 transition hover:text-white"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-cyan-400/80" />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {c.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}

        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white/45">
          Choose a workspace
        </h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Link href={feature.href} className="group block h-full">
                  <div className="relative h-full">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.12] rounded-3xl blur-xl transition-opacity duration-500`}
                    />
                    <div
                      className={`relative flex h-full flex-col rounded-3xl border ${feature.border} bg-[#0a0a0a]/80 p-8 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/20`}
                    >
                      <div
                        className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-white md:text-2xl">
                        {feature.title}
                      </h3>
                      <p className="mb-6 flex-1 text-sm leading-relaxed text-white/60 md:text-base">
                        {feature.description}
                      </p>
                      <div className="flex items-center text-sm font-medium text-cyan-400 group-hover:translate-x-1 transition-transform">
                        Open
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
