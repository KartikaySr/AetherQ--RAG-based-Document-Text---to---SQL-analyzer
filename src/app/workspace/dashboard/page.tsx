"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  PieChart,
  Terminal,
  FileText,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Search
} from "lucide-react";
import { AutoChart } from "@/components/chat/AutoChart";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

const SIMULATED_DATA = {
  revenue: [
    { month: "Jan", actual: 45000, target: 40000 },
    { month: "Feb", actual: 52000, target: 45000 },
    { month: "Mar", actual: 48000, target: 45000 },
    { month: "Apr", actual: 61000, target: 50000 },
    { month: "May", actual: 59000, target: 55000 },
    { month: "Jun", actual: 75000, target: 60000 },
  ],
  systemHealth: [
    { time: "10:00", latency: 12 },
    { time: "10:05", latency: 14 },
    { time: "10:10", latency: 11 },
    { time: "10:15", latency: 18 },
    { time: "10:20", latency: 13 },
    { time: "10:25", latency: 15 },
  ]
};

// Bento Box Container for unified styles
function BentoBox({ children, className = "", delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative overflow-hidden rounded-[32px] border border-[#D4AF37]/20 bg-[#030604]/60 p-6 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.5)] hover:border-[#D4AF37]/40 transition-colors duration-500 ${className}`}
    >
      {/* Luxury glow effect on hover */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { setCopilotOpen } = useWorkspaceStore();
  const [dynamicWidgets, setDynamicWidgets] = useState<{ id: string, title: string, value: string, icon: any, metric: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [role, setRole] = useState<"Executive" | "Data Engineer">("Executive");

  const simulateAIWidgetGeneration = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newWidget = {
        id: Math.random().toString(),
        title: "AI Analysis: Risk",
        value: "Low",
        icon: ShieldAlert,
        metric: "100% compliant",
      };
      setDynamicWidgets([...dynamicWidgets, newWidget]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-full p-4 lg:p-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D4AF37]/10 pb-6 mb-8 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center gap-4"
        >
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold tracking-tight luxury-text-gradient mb-2">
              {role === "Executive" ? "Executive Command" : "Engineering Console"}
            </h1>
            <p className="text-[13px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]/70">
              {role === "Executive" ? "Real-time Enterprise Intelligence" : "System Architecture & Flow"}
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center gap-4"
        >
          <div className="hidden sm:flex bg-black/40 border border-white/10 rounded-full p-1 mr-2 md:mr-4">
            <button 
              onClick={() => setRole("Executive")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${role === "Executive" ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "text-white/40 hover:text-white"}`}
            >
              Exec
            </button>
            <button 
              onClick={() => setRole("Data Engineer")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${role === "Data Engineer" ? "bg-emerald-500/20 text-emerald-400" : "text-white/40 hover:text-white"}`}
            >
              Eng
            </button>
          </div>

          <button 
            onClick={() => setCopilotOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/20 transition shadow-[0_0_15px_rgba(212,175,55,0.1)]"
          >
            <Search size={16} />
            Global Search
            <kbd className="ml-2 font-sans text-[10px] bg-black/40 px-2 py-0.5 rounded border border-[#D4AF37]/20">⌘K</kbd>
          </button>
          
          <button 
            onClick={simulateAIWidgetGeneration}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-100 text-sm font-medium hover:bg-emerald-500/30 transition disabled:opacity-50"
          >
            <div className={`w-2 h-2 rounded-full bg-[#E6C875] shadow-[0_0_8px_rgba(230,200,117,0.8)] ${isGenerating ? 'animate-bounce' : 'animate-pulse'}`} />
            {isGenerating ? "Generating Widget..." : "Generate AI Widget"}
          </button>
        </motion.div>
      </div>

      {role === "Executive" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[160px]">
        
        {/* Main Revenue Chart - Spans 2x2 */}
        <BentoBox className="md:col-span-2 md:row-span-2" delay={0.1}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#006039,#D4AF37)] text-white shadow-lg border border-[#D4AF37]/30">
                <BarChart3 size={18} />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#E5E4E2]">Financial Trajectory</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">$340K</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">+14.5% vs H1</div>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <AutoChart data={SIMULATED_DATA.revenue} />
          </div>
        </BentoBox>

        {/* Small KPI - Users */}
        <BentoBox delay={0.2}>
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between text-[#D4AF37]/70">
              <Users size={20} />
              <ArrowUpRight size={18} className="text-[#006039]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">Active Users</div>
              <div className="text-4xl font-serif font-bold text-white">4,170</div>
              <div className="text-xs font-medium text-[#D4AF37] mt-1">+5.2% this week</div>
            </div>
          </div>
        </BentoBox>

        {/* Small KPI - Latency */}
        <BentoBox delay={0.3}>
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between text-[#D4AF37]/70">
              <Activity size={20} />
              <div className="text-[10px] uppercase font-bold text-[#D4AF37]/50 border border-[#D4AF37]/20 px-2 py-0.5 rounded-full">Optimal</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">System Latency</div>
              <div className="text-4xl font-serif font-bold text-white">12<span className="text-lg text-white/40 ml-1">ms</span></div>
              <div className="h-6 mt-2 w-full">
                <AutoChart data={SIMULATED_DATA.systemHealth} />
              </div>
            </div>
          </div>
        </BentoBox>

        {/* Recent Intelligence Log - Spans 1x2 (Vertical) */}
        <BentoBox className="md:row-span-2" delay={0.4}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20">
              <Terminal size={14} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#E5E4E2]">Audit Log</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {[
              { time: "2m ago", text: "Q3 Projection Model updated", icon: FileText, color: "text-blue-400" },
              { time: "15m ago", text: "Enterprise sync completed", icon: Activity, color: "text-[#D4AF37]" },
              { time: "1h ago", text: "New anomaly detected in EU-West", icon: ShieldAlert, color: "text-rose-400" },
              { time: "2h ago", text: "AetherQ completed 402 tasks", icon: Sparkles, color: "text-[#006039]" },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 items-start border-l-2 border-[#D4AF37]/10 pl-3">
                <log.icon size={14} className={`mt-0.5 ${log.color}`} />
                <div>
                  <p className="text-[13px] text-white/80">{log.text}</p>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </BentoBox>

        {/* User Distribution - Spans 1x1 */}
        <BentoBox delay={0.5}>
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={16} className="text-[#D4AF37]" />
              <h3 className="font-serif font-bold text-sm text-white">Segment Share</h3>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-3">
              {[
                { name: "Enterprise", pct: 60, color: "bg-[#D4AF37]" },
                { name: "Pro", pct: 30, color: "bg-[#006039]" },
                { name: "Free", pct: 10, color: "bg-white/20" },
              ].map((s, i) => (
                <div key={s.name}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/60">{s.name}</span>
                    <span className="font-bold text-white">{s.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 1, delay: 0.6 + (i*0.2) }}
                      className={`h-full rounded-full ${s.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BentoBox>

        {dynamicWidgets.map((widget, idx) => (
          <BentoBox key={widget.id} delay={0.1}>
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center justify-between text-[#D4AF37]/70">
                <widget.icon size={20} />
                <div className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">AI Generated</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">{widget.title}</div>
                <div className="text-4xl font-serif font-bold text-white">{widget.value}</div>
                <div className="text-xs font-medium text-[#D4AF37] mt-2">{widget.metric}</div>
              </div>
            </div>
          </BentoBox>
        ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BentoBox delay={0.1}>
             <h3 className="font-serif font-bold text-xl text-[#E5E4E2] mb-4">Database Schema: aether_prod</h3>
             <pre className="text-[11px] text-emerald-400 font-mono bg-black/40 p-4 rounded-xl border border-emerald-500/20 overflow-auto">
{`CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role_id INT REFERENCES roles(id),
  last_login TIMESTAMP
);

CREATE TABLE analytics_events (
  event_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50),
  payload JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);`}
             </pre>
           </BentoBox>
           <BentoBox delay={0.2}>
             <h3 className="font-serif font-bold text-xl text-[#E5E4E2] mb-4">Active API Endpoints (GraphQL)</h3>
             <pre className="text-[11px] text-[#D4AF37] font-mono bg-black/40 p-4 rounded-xl border border-[#D4AF37]/20 overflow-auto h-[260px] custom-scrollbar">
{`query GetDashboardMetrics {
  revenue(timeframe: "YTD") {
    actual
    target
    variance
  }
  systemHealth {
    latency
    uptime
    activeConnections
  }
}

// Subscriptions
subscription OnAnomalyDetected {
  anomalyDetected {
    id
    severity
    description
  }
}`}
             </pre>
           </BentoBox>
        </div>
      )}
    </div>
  );
}
