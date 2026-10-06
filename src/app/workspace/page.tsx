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
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import {
  conversationService,
  type ConversationSummary,
} from "@/services/conversationService";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeoButton } from "@/components/ui/NeoButton";

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
        "Conversational intelligence with autonomous routing.",
      href: "/workspace/chat",
      iconColor: "text-[#D4AF37]",
    },
    {
      icon: Database,
      title: "Data Analytics",
      description:
        "Natural language to validated SQL warehouse insights.",
      href: "/workspace/analytics",
      iconColor: "text-[#D4AF37]",
    },
    {
      icon: FileText,
      title: "Document Vault",
      description:
        "Upload and query your files with RAG vector search.",
      href: "/workspace/documents",
      iconColor: "text-[#D4AF37]",
    },
  ];

  const initial =
    (user?.email?.[0] ?? "?").toUpperCase() +
    (user?.email?.split("@")[0]?.slice(-1)?.toUpperCase() ?? "");

  return (
    <div className="min-h-screen relative overflow-hidden bg-black selection:bg-[#D4AF37]/30 selection:text-white">

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10"
        >
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2A2A2A] bg-[#141414] text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.2em] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              Intelligence Mesh Active
            </div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wide text-white mb-4">
              {greeting},<br />
              <span className="font-serif italic text-[#D4AF37]">
                {displayName}
              </span>
            </h1>
            <p className="text-lg text-white/50 leading-relaxed font-light">
              Your workspace is cryptographically isolated. Deploy modules below to analyze data, query files, or collaborate with AetherQ.
            </p>
          </div>

          <GlassCard className="p-6 shrink-0 md:w-80" interactive={false}>
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#141414] border border-[#2A2A2A] text-xl font-bold text-[#D4AF37]">
                {initial.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#666666] mb-1">
                  Verified Identity
                </p>
                <p className="truncate text-base font-semibold text-white">
                  {user?.email ?? "—"}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#D4AF37]">
                  <Shield className="h-4 w-4 shrink-0" />
                  RLS Vault Secured
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          <GlassCard className="p-8" interactive={false}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3">
              Vault Documents
            </p>
            <p className="text-4xl font-light text-white tracking-wide">
              {stats.documentCount}
            </p>
          </GlassCard>
          <GlassCard className="p-8" interactive={false}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3">
              Saved Conversations
            </p>
            <p className="text-4xl font-light text-white tracking-wide">
              {stats.conversationCount}
            </p>
          </GlassCard>
          <GlassCard className="p-8 bg-gradient-to-br from-emerald-500/5 to-amber-500/5" interactive={false}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/80 mb-3">
              Isolation Level
            </p>
            <p className="text-2xl font-light text-white tracking-wide mb-2">Absolute</p>
            <p className="text-xs text-white/40 font-medium">Row Level Security Active</p>
          </GlassCard>
        </div>

        {/* Modules Grid */}
        <h2 className="mb-8 text-sm font-bold uppercase tracking-[0.2em] text-white/50 pl-2 border-l-2 border-[#D4AF37]/50">
          Deploy Modules
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <GlassCard key={feature.href} href={feature.href} className="p-10 flex flex-col justify-between group h-[340px]">
                <div>
                  <div className={`w-16 h-16 rounded-[20px] bg-[#141414] border border-[#2A2A2A] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-medium font-sans text-white mb-3 tracking-wide">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>
                <div className={`mt-8 flex items-center gap-2 font-semibold ${feature.iconColor} group-hover:translate-x-2 transition-transform duration-300`}>
                  Initialize <ChevronRight size={18} />
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Recent Conversations */}
        {recent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-8" interactive={false}>
              <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                  Recent Transcripts
                </h2>
                <NeoButton href="/workspace/chat" variant="ghost" className="text-xs py-1.5 px-3 rounded-full border border-[#2A2A2A] bg-[#141414] text-[#D4AF37] hover:bg-[#1F1F1F]">
                  View All <ArrowRight size={14} className="ml-1" />
                </NeoButton>
              </div>
              <ul className="divide-y divide-white/5">
                {recent.map((c) => (
                  <li key={c.id}>
                    <Link
                      href="/workspace/chat"
                      className="group flex items-center gap-4 py-4 text-sm text-white/70 transition-colors hover:text-white"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors border border-white/5">
                        <MessageSquare className="h-4 w-4 shrink-0" />
                      </div>
                      <span className="min-w-0 flex-1 truncate font-medium text-base">
                        {c.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
