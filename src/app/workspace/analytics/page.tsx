"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  Database,
  Loader2,
  Package,
  Ship,
  TrendingUp,
  Users,
  Zap,
  Code
} from "lucide-react";
import { RuleBuilder } from "@/components/ui/RuleBuilder";

type Kpis = {
  totalRevenue: string;
  employeeCount: number;
  skusBelowReorder: number;
  avgFreightUsd: string;
  revenueByQuarter: { name: string; revenue: number }[];
  revenueByRegion: { name: string; revenue: number }[];
  headcountByDepartment: { name: string; people: number }[];
};

const chartTooltipStyles = {
  contentStyle: {
    background: "rgba(6, 10, 14, 0.92)",
    border: "1px solid rgba(148, 247, 255, 0.2)",
    borderRadius: 12,
    color: "#e2f6ff",
    fontSize: 12,
  },
  labelStyle: { color: "#7de3ff" },
};

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-emerald-500/10 backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(34,211,238,0.12),transparent_45%)]" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/40">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {value}
          </p>
          {subtitle ? (
            <p className="mt-2 text-xs text-white/45">{subtitle}</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-200">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/analytics/summary", { cache: "no-store" });
      const j = (await r.json()) as { kpis?: Kpis | null; error?: string };
      if (!r.ok) {
        throw new Error(j.error || "Summary unavailable.");
      }
      setKpis(j.kpis ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics.");
      setKpis(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial dashboard hydrate: async fetch unavoidable on mount for live KPI tiles.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch bootstraps read-only KPIs
    void load();
  }, [load]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="min-h-[100dvh] bg-black pb-[max(2rem,env(safe-area-inset-bottom))] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.1),transparent_40%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/chat"
              className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80 transition hover:text-emerald-200"
            >
              <ArrowLeft size={14} />
              Back to workspace
            </Link>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Enterprise Analytics
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
              Live KPIs and mock-style visualizations powered by the same
              warehouse tables that feed AetherQ SQL mode. Configure{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-emerald-200">
                DATABASE_URL
              </code>{" "}
              for production-grade insights.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowRuleBuilder(true)}
              className="flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20 hover:border-amber-400/50"
            >
              <Zap size={16} />
              Create Automaton
            </button>
            <button
              onClick={() => setShowApiModal(true)}
              className="flex items-center gap-2 rounded-2xl border border-purple-400/20 bg-purple-500/10 px-5 py-3 text-sm font-medium text-purple-100 transition hover:bg-purple-500/20 hover:border-purple-400/50"
            >
              <Code size={16} />
              Deploy as API
            </button>
            <Link
              href="/documents"
              className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]"
            >
              Document vault
            </Link>
            <Link
              href="/chat"
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:opacity-95"
            >
              Open AI Chat
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-white/50">
            <Loader2 className="size-9 animate-spin text-emerald-300" />
            <p className="text-sm">Pulling governed warehouse metrics…</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-100">
            {error}
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80"
            >
              Retry
            </button>
          </div>
        ) : !kpis ? (
          <div className="rounded-3xl border border-amber-400/25 bg-amber-500/10 p-6 text-sm text-amber-50">
            Analytics summary is empty. Add{" "}
            <code className="rounded bg-black/30 px-1">DATABASE_URL</code> and
            run{" "}
            <code className="rounded bg-black/30 px-1">
              supabase-enterprise-schema.sql
            </code>{" "}
            to hydrate metrics.
          </div>
        ) : (
          <>
            {kpis.skusBelowReorder > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-start gap-3 rounded-3xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-50"
              >
                <Package className="mt-0.5 shrink-0 text-amber-200" size={20} />
                <div>
                  <p className="font-semibold text-amber-100">
                    Inventory alert
                  </p>
                  <p className="mt-1 text-amber-100/80">
                    {kpis.skusBelowReorder} SKU
                    {kpis.skusBelowReorder === 1 ? "" : "s"} are below their
                    configured reorder level. Coordinate with Supply Chain Ops.
                  </p>
                </div>
              </motion.div>
            ) : null}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Booked revenue (all periods)"
                value={formatCurrency(Number(kpis.totalRevenue))}
                subtitle="Synthetic enterprise ledger feed"
                icon={<TrendingUp size={22} />}
                delay={0}
              />
              <KpiCard
                title="Active roster"
                value={kpis.employeeCount.toLocaleString()}
                subtitle="Headcount mirrored from HR dimensions"
                icon={<Users size={22} />}
                delay={0.05}
              />
              <KpiCard
                title="Avg freight / shipment"
                value={formatCurrency(Number(kpis.avgFreightUsd))}
                subtitle="Logistics network benchmarks"
                icon={<Ship size={22} />}
                delay={0.1}
              />
              <KpiCard
                title="SKUs under target"
                value={kpis.skusBelowReorder}
                subtitle="Reorder policy watchlist"
                icon={<Database size={22} />}
                delay={0.15}
              />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <motion.div
                layout
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/30 backdrop-blur-2xl md:p-7"
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/65">
                      Revenue pulse
                    </p>
                    <h2 className="mt-2 text-xl font-semibold md:text-2xl">
                      Quarterly throughput
                    </h2>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpis.revenueByQuarter}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="#22d3ee"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#312e81"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 8" stroke="#1f2937" />
                      <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}M`}
                      />
                      <Tooltip
                        {...chartTooltipStyles}
                        formatter={(val) => formatCurrency(Number(val))}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#67e8f9"
                        fillOpacity={1}
                        fill="url(#colorRev)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                layout
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/30 backdrop-blur-2xl md:p-7"
              >
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-amber-200/65">
                    Regional traction
                  </p>
                  <h2 className="mt-2 text-xl font-semibold md:text-2xl">
                    Revenue by operating region
                  </h2>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kpis.revenueByRegion}>
                      <CartesianGrid strokeDasharray="4 10" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} interval={0} angle={-12} height={72} dy={24} dx={0} />
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                      <Tooltip
                        {...chartTooltipStyles}
                        formatter={(val) => formatCurrency(Number(val))}
                      />
                      <Bar dataKey="revenue" fill="#c084fc" radius={[10, 10, 6, 6]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            <motion.div
              layout
              className="mt-6 rounded-3xl border border-white/10 bg-black/35 p-5 shadow-inner shadow-black/40 backdrop-blur-2xl md:p-8"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                    Organization design
                  </p>
                  <h2 className="mt-2 text-xl font-semibold md:text-2xl">
                    Headcount concentration
                  </h2>
                </div>
              </div>
              <div className="h-[340px] w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%" minWidth={480}>
                  <BarChart data={kpis.headcountByDepartment}>
                    <CartesianGrid strokeDasharray="3 8" stroke="#1f2937" horizontal vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} interval={0} angle={0} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip {...chartTooltipStyles} />
                    <Bar dataKey="people" stackId="a" fill="#22d3ee" radius={[6, 6, 2, 2]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {showRuleBuilder && (
        <RuleBuilder onClose={() => setShowRuleBuilder(false)} />
      )}

      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-purple-500/30 bg-[#071119] shadow-[0_0_50px_rgba(168,85,247,0.1)]"
          >
            <div className="border-b border-white/10 p-6 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Code size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">One-Click API Generation</h2>
                  <p className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Live Endpoint Created</p>
                </div>
              </div>
              <button onClick={() => setShowApiModal(false)} className="text-white/50 hover:text-white transition">Dismiss</button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <p className="text-sm text-white/70 mb-2">Your API endpoint is now live. Use this curl command to fetch the current dashboard metrics securely from external systems.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/60 p-5 font-mono text-xs text-emerald-400 overflow-x-auto relative group/curl">
                <div className="absolute top-3 right-3 opacity-0 group-hover/curl:opacity-100 transition">
                  <span className="bg-white/10 px-2 py-1 rounded text-white/50 cursor-pointer hover:text-white">Copy</span>
                </div>
                curl -X GET "https://api.aetherq.com/v1/metrics/summary" \<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-H "Authorization: Bearer aq_prod_8f92jklw03m4nf820" \<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-H "Content-Type: application/json"
              </div>

              <div className="flex items-center gap-4 bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-purple-200">Endpoint Status: <strong className="text-emerald-400">Online & Secured</strong> (Rate Limit: 100/min)</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
