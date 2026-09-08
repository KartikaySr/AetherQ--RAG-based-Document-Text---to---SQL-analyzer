"use client";

import { motion } from "framer-motion";
import { MessageSquare, ShieldCheck, X, CheckCircle2, Webhook } from "lucide-react";
import { useState } from "react";

export function IntegrationsModal({ onClose }: { onClose: () => void }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#071119] shadow-2xl"
      >
        <div className="border-b border-white/10 p-6 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Webhook size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">App Integrations</h2>
              <p className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Workspace Extensions</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition group gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition">
                <MessageSquare className="text-white" size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold truncate">Slack Copilot</h3>
                <p className="text-xs text-white/50 truncate">Query AetherQ directly from Slack</p>
              </div>
            </div>
            
            <div className="shrink-0">
              {connected ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 size={16} />
                  Connected
                </div>
              ) : connecting ? (
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                  Connecting...
                </div>
              ) : (
                <button 
                  onClick={handleConnect}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold truncate">Microsoft Teams</h3>
                <p className="text-xs text-white/50 truncate">Enterprise rollout pending</p>
              </div>
            </div>
            <div className="shrink-0">
              <button disabled className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 text-white/50 text-sm font-medium">
                Coming Q4
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
