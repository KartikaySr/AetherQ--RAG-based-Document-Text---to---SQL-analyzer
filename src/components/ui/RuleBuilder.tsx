"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Webhook, Zap, ArrowRight, Save, Plus } from "lucide-react";

export function RuleBuilder({ onClose }: { onClose: () => void }) {
  const [metric, setMetric] = useState("revenue");
  const [condition, setCondition] = useState("<");
  const [threshold, setThreshold] = useState("50000");
  const [action, setAction] = useState("pagerduty");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-500/30 bg-[#071119] shadow-[0_0_50px_rgba(245,158,11,0.1)]"
      >
        <div className="border-b border-white/10 p-6 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Action Trigger Builder</h2>
              <p className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Automate based on data anomalies</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition">Dismiss</button>
        </div>

        <div className="p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 text-right text-xs font-bold uppercase tracking-widest text-amber-200/70">IF</div>
              <select 
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"
              >
                <option value="revenue">Q3 Revenue</option>
                <option value="churn">Customer Churn Rate</option>
                <option value="latency">API Latency (ms)</option>
                <option value="errors">Error Rate (%)</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 text-right text-xs font-bold uppercase tracking-widest text-amber-200/70">IS</div>
              <div className="flex flex-1 gap-3">
                <select 
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-1/3 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"
                >
                  <option value="<">Less than</option>
                  <option value=">">Greater than</option>
                  <option value="=">Exactly</option>
                  <option value="drops">Drops by %</option>
                </select>
                <input 
                  type="text" 
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-2/3 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="flex justify-center py-2">
              <ArrowRight className="text-white/20 rotate-90" size={20} />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 text-right text-xs font-bold uppercase tracking-widest text-emerald-300/70">THEN</div>
              <select 
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
              >
                <option value="pagerduty">Trigger PagerDuty Incident</option>
                <option value="slack">Send Slack Alert (#ops-critical)</option>
                <option value="email">Email Executive Team</option>
                <option value="webhook">Call Custom Webhook POST</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-6 bg-white/[0.02] flex justify-between items-center">
          <button className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition">
            <Plus size={16} /> Add AND condition
          </button>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400"
          >
            <Save size={16} /> Save Automaton
          </button>
        </div>
      </motion.div>
    </div>
  );
}
