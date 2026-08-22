"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, Activity, GitCommit, Database, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const erpEvents = [
  { id: 1, time: "10:42 AM", type: "Blue Team", message: "SAP ERP Ledger sync completed. 1,420 records verified.", status: "ok" },
  { id: 2, time: "10:45 AM", type: "Red Team", message: "Anomaly detected: Unmatched invoice sequence in AP ledger.", status: "alert" },
  { id: 3, time: "10:48 AM", type: "System", message: "Automated reconciliation triggered via AI Copilot.", status: "info" },
  { id: 4, time: "10:55 AM", type: "Blue Team", message: "Sequence gap resolved. Validated against vendor master data.", status: "ok" },
];

export default function ContinuousAssurancePage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white lg:flex-row">
      <main className="relative min-h-[100dvh] flex-1 px-4 py-6 md:px-8 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.08),transparent_40%)]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <header className="mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              <ShieldCheck size={14} />
              Module Active
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-white mb-4">
              Continuous Assurance
            </h1>
            <p className="max-w-2xl text-lg text-white/60 font-light">
              Real-time audit intelligence. Red Team algorithms probe for vulnerabilities while Blue Team agents enforce compliance and reconcile ERP streams dynamically.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Temporal Graph (Visual Placeholder) */}
            <div className="lg:col-span-2">
              <GlassCard className="h-full p-6" interactive={false}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-serif text-[#D4AF37]">Temporal Sync Graph</h2>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Activity size={16} className="text-emerald-400" /> Live Feed
                  </div>
                </div>
                
                <div className="relative h-64 w-full rounded-2xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
                  
                  {/* Mock Graph nodes */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <div className="absolute w-40 h-40 border border-emerald-500/30 rounded-full" />
                    <div className="absolute w-64 h-64 border border-[#D4AF37]/30 rounded-full border-dashed" />
                    <div className="absolute w-8 h-8 bg-emerald-500/20 rounded-full border border-emerald-400 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                      <Database size={14} className="text-emerald-300" />
                    </div>
                  </motion.div>
                </div>
              </GlassCard>
            </div>

            {/* Red Team vs Blue Team Feed */}
            <div className="lg:col-span-1">
              <GlassCard className="h-full p-6 flex flex-col" interactive={false}>
                <h2 className="text-xl font-bold font-serif text-[#D4AF37] mb-6">Agent Event Stream</h2>
                <div className="flex-1 space-y-4">
                  {erpEvents.map((evt, i) => (
                    <motion.div 
                      key={evt.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className={`relative pl-4 border-l-2 ${evt.status === 'ok' ? 'border-emerald-500' : evt.status === 'alert' ? 'border-red-500' : 'border-amber-500'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-white/40">{evt.time}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${evt.type === 'Red Team' ? 'bg-red-500/20 text-red-300' : evt.type === 'Blue Team' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {evt.type}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{evt.message}</p>
                    </motion.div>
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
