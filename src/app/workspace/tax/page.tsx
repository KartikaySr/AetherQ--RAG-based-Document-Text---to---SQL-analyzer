"use client";

import { motion } from "framer-motion";
import { Webhook, Map, Receipt, AlertCircle, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const taxRegions = [
  { name: "Ireland", rate: "12.5%", effective: "15.0%", status: "compliant" },
  { name: "Singapore", rate: "17.0%", effective: "17.0%", status: "compliant" },
  { name: "Bermuda", rate: "0.0%", effective: "15.0%", status: "flagged", note: "Pillar Two Top-up Applies" },
];

export default function TaxRoutingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white lg:flex-row">
      <main className="relative min-h-[100dvh] flex-1 px-4 py-6 md:px-8 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.08),transparent_40%)]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <header className="mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-pink-300">
              <Webhook size={14} />
              Module Active
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-white mb-4">
              Dynamic Tax Routing
            </h1>
            <p className="max-w-2xl text-lg text-white/60 font-light">
              Visualize supply chain cash flows and detect OECD Pillar Two anomalies. Optimize transfer pricing in real-time across global entities.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GlassCard className="h-full p-6 flex flex-col" interactive={false}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-serif text-[#D4AF37]">Global Supply Chain Map</h2>
                  <Map size={18} className="text-white/40" />
                </div>
                
                <div className="relative flex-1 rounded-2xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center p-8">
                  {/* Decorative Map Placeholder */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="w-full max-w-lg h-full border border-dashed border-white/10 rounded-xl relative flex items-center justify-center"
                  >
                    <div className="absolute left-1/4 top-1/3 w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,1)]" />
                    <div className="absolute right-1/4 bottom-1/3 w-4 h-4 bg-pink-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,1)]" />
                    <div className="absolute right-1/3 top-1/4 w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,1)]" />
                    
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }}>
                      <path d="M 120 100 Q 250 50 350 150" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M 350 150 Q 300 250 200 200" fill="none" stroke="rgba(236,72,153,0.5)" strokeWidth="2" />
                    </svg>
                    
                    <p className="text-white/20 font-bold uppercase tracking-widest text-sm z-10 bg-black/50 px-4 py-2 rounded-lg">Real-time Entity Routing</p>
                  </motion.div>
                </div>
              </GlassCard>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <GlassCard className="p-6" interactive={false}>
                <h3 className="text-sm uppercase tracking-widest text-white/50 font-semibold mb-2">Pillar Two Exposure</h3>
                <p className="font-serif text-4xl font-bold text-pink-400 mb-2">$14.2M</p>
                <div className="flex items-center gap-2 text-xs text-red-300 bg-red-500/10 w-fit px-2 py-1 rounded-full border border-red-500/20">
                  <AlertCircle size={12} /> Pending Top-up Tax
                </div>
              </GlassCard>

              <GlassCard className="p-6" interactive={false}>
                <h3 className="text-sm uppercase tracking-widest text-white/50 font-semibold mb-4">Jurisdiction Monitor</h3>
                <div className="space-y-4">
                  {taxRegions.map((region, idx) => (
                    <div key={idx} className="flex flex-col gap-1 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white/90">{region.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${region.status === 'compliant' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-pink-500/20 text-pink-300'}`}>
                          {region.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-white/50">
                        <span>Statutory: {region.rate}</span>
                        <span>Effective: {region.effective}</span>
                      </div>
                      {region.note && (
                        <span className="text-[10px] text-pink-400 mt-1">{region.note}</span>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
