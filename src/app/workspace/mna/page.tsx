"use client";

import { motion } from "framer-motion";
import { Briefcase, TrendingUp, AlertTriangle, Fingerprint, Activity, Network, Layers, ShieldCheck, Download, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const synergyData = [
  { month: "M1", expected: 10, actual: 8 },
  { month: "M3", expected: 25, actual: 28 },
  { month: "M6", expected: 45, actual: 49 },
  { month: "M9", expected: 75, actual: 82 },
  { month: "M12", expected: 110, actual: 124 },
  { month: "M18", expected: 160, actual: null },
  { month: "M24", expected: 210, actual: null },
];

const riskRadar = [
  { subject: "Cultural Alignment", A: 85, fullMark: 100 },
  { subject: "Tech Stack", A: 65, fullMark: 100 },
  { subject: "Financial Liabilities", A: 90, fullMark: 100 },
  { subject: "Talent Retention", A: 70, fullMark: 100 },
  { subject: "Compliance", A: 95, fullMark: 100 },
  { subject: "Market Overlap", A: 60, fullMark: 100 },
];

const executionPhases = [
  { phase: "Diligence Readiness", progress: 100, status: "complete" },
  { phase: "Regulatory Filings", progress: 85, status: "active" },
  { phase: "System Integration", progress: 30, status: "active" },
  { phase: "Cultural Assimilation", progress: 10, status: "pending" },
];

export default function MnaRiskPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white lg:flex-row">
      <main className="relative min-h-[100dvh] flex-1 px-4 py-8 md:px-10 md:py-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.06),transparent_40%),radial-gradient(circle_at_90%_80%,rgba(212,175,55,0.06),transparent_40%)]" />
          <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400 backdrop-blur-md">
                <Activity size={14} />
                <span>Sonar Intelligence Active</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-3">
                Post-Merger <span className="font-medium text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]">Integration Forecast</span>
              </h1>
              <p className="max-w-2xl text-base text-white/60 font-light leading-relaxed">
                Enterprise-grade synergy modeling. Correlating human capital flight risk, technical debt assimilation, and EBITDA accretion across 18-month execution timelines.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20">
                <Download size={16} />
                Export Model
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-2.5 text-sm font-medium text-[#D4AF37] transition-all hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <ShieldCheck size={16} />
                Initiate Deal Room
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6 rounded-3xl" interactive={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-widest text-white/50 font-medium">Predicted Value</h3>
                <div className="p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <TrendingUp size={16} className="text-emerald-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-[#D4AF37] tracking-tight">$124<span className="text-2xl text-[#D4AF37]/70">M</span></p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">+8.2%</span>
                <p className="text-xs text-white/40">vs standard baseline</p>
              </div>
            </GlassCard>

            <GlassCard className="p-6 rounded-3xl" interactive={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-widest text-white/50 font-medium">Integration ETA</h3>
                <div className="p-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <Layers size={16} className="text-blue-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-white tracking-tight">18 <span className="text-xl text-white/60">Months</span></p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">On Track</span>
                <p className="text-xs text-white/40">Phase 2 Systems</p>
              </div>
            </GlassCard>

            <GlassCard className="p-6 rounded-3xl" interactive={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-widest text-white/50 font-medium">Flight Risk</h3>
                <div className="p-2 bg-amber-500/10 rounded-full border border-amber-500/20">
                  <AlertTriangle size={16} className="text-amber-400" />
                </div>
              </div>
              <p className="text-4xl font-light text-amber-400 tracking-tight">14<span className="text-xl text-amber-400/70">%</span></p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-md">Elevated</span>
                <p className="text-xs text-white/40">Key Engineering VP</p>
              </div>
            </GlassCard>

            <GlassCard className="p-6 rounded-3xl" interactive={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-widest text-white/50 font-medium">Target Entity</h3>
                <div className="p-2 bg-purple-500/10 rounded-full border border-purple-500/20">
                  <Fingerprint size={16} className="text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-medium text-white line-clamp-1 mt-2">QuantumCore Inc.</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md">Series D</span>
                <p className="text-xs text-white/40">Acquisition ID: QCI-04</p>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="col-span-1 lg:col-span-2 p-6 md:p-8 rounded-3xl" interactive={false}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-medium text-white mb-1">Synergy Realization Trajectory</h2>
                  <p className="text-sm text-white/50">Cumulative EBITDA impact over 24 months</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                    <span className="text-xs text-white/60">Actualized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/10 border border-white/30" />
                    <span className="text-xs text-white/60">Projected</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={synergyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgba(255,255,255,0.1)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="rgba(255,255,255,0.05)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={12} tickMargin={10} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickFormatter={(val) => `$${val}M`} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#D4AF37' }}
                    />
                    <Area type="monotone" dataKey="expected" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorExpected)" />
                    <Area type="monotone" dataKey="actual" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
            
            <div className="col-span-1 flex flex-col gap-6">
              <GlassCard className="p-6 rounded-3xl flex-1" interactive={false}>
                <h2 className="text-lg font-medium text-white mb-1">Diligence Sonar</h2>
                <p className="text-sm text-white/50 mb-6">Multi-dimensional risk assessment</p>
                
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskRadar}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Alignment" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard className="p-6 rounded-3xl flex-1" interactive={false}>
                <h2 className="text-lg font-medium text-white mb-4">Execution Pathway</h2>
                <div className="space-y-4">
                  {executionPhases.map((phase, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex justify-between items-end mb-1">
                        <span className={`text-sm font-medium ${phase.status === 'complete' ? 'text-emerald-400' : phase.status === 'active' ? 'text-amber-400' : 'text-white/40'}`}>
                          {phase.phase}
                        </span>
                        <span className="text-xs text-white/30">{phase.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${phase.progress}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${phase.status === 'complete' ? 'bg-emerald-500' : phase.status === 'active' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-white/20'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-center">
            <button className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors">
              <Network size={14} />
              <span>Connect internal HRIS to refine talent retention models</span>
              <ExternalLink size={12} className="opacity-50" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
