"use client";

import { motion } from "framer-motion";
import { Briefcase, TrendingUp, AlertTriangle, Fingerprint, LineChart } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const riskFactors = [
  { id: 1, label: "Cultural Friction", score: 82, trend: "+5%", alert: true },
  { id: 2, label: "Tech Stack Redundancy", score: 45, trend: "-2%", alert: false },
  { id: 3, label: "Hidden Liabilities", score: 12, trend: "Stable", alert: false },
  { id: 4, label: "Key Personnel Flight Risk", score: 68, trend: "+12%", alert: true },
];

export default function MnaRiskPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white lg:flex-row">
      <main className="relative min-h-[100dvh] flex-1 px-4 py-6 md:px-8 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.08),transparent_40%)]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <header className="mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              <Briefcase size={14} />
              Module Active
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-white mb-4">
              M&A Risk Prediction
            </h1>
            <p className="max-w-2xl text-lg text-white/60 font-light">
              Predictive synergy modeling and deep diligence. Uncover cultural friction, hidden liabilities, and exact integration timelines before the ink dries.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <GlassCard className="p-6" interactive={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm uppercase tracking-widest text-white/50 font-semibold">Predicted Synergy</h3>
                <TrendingUp size={18} className="text-emerald-400" />
              </div>
              <p className="font-serif text-4xl font-bold text-[#D4AF37]">$124M</p>
              <p className="text-xs text-white/40 mt-2">Expected Year 1 Value</p>
            </GlassCard>
            <GlassCard className="p-6" interactive={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm uppercase tracking-widest text-white/50 font-semibold">Integration Time</h3>
                <LineChart size={18} className="text-amber-400" />
              </div>
              <p className="font-serif text-4xl font-bold text-white">18 <span className="text-xl">mo</span></p>
              <p className="text-xs text-white/40 mt-2">Based on IT complexity</p>
            </GlassCard>
            <GlassCard className="p-6" interactive={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm uppercase tracking-widest text-white/50 font-semibold">Overall Risk</h3>
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <p className="font-serif text-4xl font-bold text-red-400">High</p>
              <p className="text-xs text-white/40 mt-2">Action required on personnel</p>
            </GlassCard>
            <GlassCard className="p-6" interactive={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm uppercase tracking-widest text-white/50 font-semibold">Target Entity</h3>
                <Fingerprint size={18} className="text-purple-400" />
              </div>
              <p className="font-serif text-2xl font-bold text-white line-clamp-1">QuantumCore</p>
              <p className="text-xs text-white/40 mt-2">Diligence Phase 2</p>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-6" interactive={false}>
              <h2 className="text-xl font-bold font-serif text-[#D4AF37] mb-6">Friction Matrix</h2>
              <div className="space-y-6">
                {riskFactors.map((factor) => (
                  <div key={factor.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/80 font-medium">{factor.label}</span>
                      <span className={factor.alert ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                        {factor.score}/100
                      </span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${factor.alert ? 'bg-red-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
            
            <GlassCard className="p-6" interactive={false}>
              <h2 className="text-xl font-bold font-serif text-[#D4AF37] mb-6">Document Intelligence</h2>
              <div className="flex items-center justify-center h-48 border border-dashed border-white/10 rounded-2xl bg-black/20">
                <div className="text-center">
                  <Briefcase size={32} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">Upload VDR contracts to extract<br/>change-of-control clauses.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
