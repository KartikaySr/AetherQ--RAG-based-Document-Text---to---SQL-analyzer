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
      bg: "from-emerald-500/20",
      iconColor: "text-emerald-400",
      shadow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    },
    {
      icon: Database,
      title: "Data Analytics",
      description:
        "Natural language to validated SQL warehouse insights.",
      href: "/workspace/analytics",
      bg: "from-amber-500/20",
      iconColor: "text-amber-400",
      shadow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    },
    {
      icon: FileText,
      title: "Document Vault",
      description:
        "Upload and query your files with RAG vector search.",
      href: "/workspace/documents",
      bg: "from-pink-500/20",
      iconColor: "text-pink-400",
      shadow: "shadow-[0_0_20px_rgba(236,72,153,0.3)]",
    },
    {
      icon: Shield,
      title: "Continuous Assurance",
      description:
        "Real-time audit intelligence with Red/Blue team ERP sync.",
      href: "/workspace/assurance",
      bg: "from-emerald-500/20",
      iconColor: "text-emerald-400",
      shadow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    },
    {
      icon: Sparkles,
      title: "M&A Risk Prediction",
      description:
        "Predict synergy, integration timelines, and cultural friction.",
      href: "/workspace/mna",
      bg: "from-amber-500/20",
      iconColor: "text-amber-400",
      shadow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    },
    {
      icon: Database,
      title: "Dynamic Tax Routing",
      description:
        "Visualize supply chain cash flows and Pillar Two exposure.",
      href: "/workspace/tax",
      bg: "from-pink-500/20",
      iconColor: "text-pink-400",
      shadow: "shadow-[0_0_20px_rgba(236,72,153,0.3)]",
    },
  ];

  const initial =
    (user?.email?.[0] ?? "?").toUpperCase() +
    (user?.email?.split("@")[0]?.slice(-1)?.toUpperCase() ?? "");

  return (
    <div className="min-h-screen relative selection:bg-emerald-500/30 selection:text-emerald-100 overflow-hidden">
      
      {/* Background Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, -50, 0], y: [0, -50, 80, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{ x: [0, -80, 60, 0], y: [0, 60, -40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] mix-blend-screen"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10"
        >
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-xs font-semibold uppercase tracking-[0.2em] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Intelligence Mesh Active
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-4">
              {greeting},<br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-600 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                {displayName}
              </span>
            </h1>
            <p className="text-xl text-white/50 leading-relaxed font-light">
              Your workspace is cryptographically isolated. Deploy modules below to analyze data, query files, or collaborate with AetherQ.
            </p>
          </div>

          <GlassCard className="p-6 shrink-0 md:w-80" interactive={false}>
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-500 text-xl font-bold text-white shadow-lg shadow-emerald-500/30">
                {initial.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-1">
                  Verified Identity
                </p>
                <p className="truncate text-base font-semibold text-white">
                  {user?.email ?? "—"}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-300/80">
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
            <p className="text-5xl font-bold text-white tracking-tight">
              {stats.documentCount}
            </p>
          </GlassCard>
          <GlassCard className="p-8" interactive={false}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3">
              Saved Conversations
            </p>
            <p className="text-5xl font-bold text-white tracking-tight">
              {stats.conversationCount}
            </p>
          </GlassCard>
          <GlassCard className="p-8 bg-gradient-to-br from-emerald-500/5 to-amber-500/5" interactive={false}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/80 mb-3">
              Isolation Level
            </p>
            <p className="text-3xl font-bold text-white tracking-tight mb-2">Absolute</p>
            <p className="text-xs text-white/40 font-medium">Row Level Security Active</p>
          </GlassCard>
        </div>

        {/* Modules Grid */}
        <h2 className="mb-8 text-sm font-bold uppercase tracking-[0.2em] text-white/50 pl-2 border-l-2 border-emerald-500/50">
          Deploy Modules
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <GlassCard key={feature.href} href={feature.href} className="p-10 flex flex-col justify-between group h-[340px]">
                <div>
                  <div className={`w-16 h-16 rounded-[20px] bg-gradient-to-br ${feature.bg} to-transparent border border-white/10 flex items-center justify-center mb-8 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-8 h-8 ${feature.iconColor} drop-shadow-md`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-white/50 text-base leading-relaxed font-light">
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
                <NeoButton href="/workspace/chat" variant="ghost" className="text-xs py-1.5 px-3 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
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
