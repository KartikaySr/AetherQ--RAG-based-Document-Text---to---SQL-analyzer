import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Server, Terminal, Cpu, Network, Sparkles, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MultiAgentTerminal() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1200);
    const t2 = setTimeout(() => setStep(2), 2400);
    const t3 = setTimeout(() => setStep(3), 3600);
    const t4 = setTimeout(() => setStep(4), 4800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const steps = [
    { text: "Initializing AEGIS Core Protocol...", icon: Terminal, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10", border: "border-[#D4AF37]/30" },
    { text: "Auditor Agent: Validating compliance against global ledgers...", icon: Database, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
    { text: "M&A Analyst Agent: Evaluating cultural friction and tech synergy...", icon: Cpu, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" },
    { text: "Tax Strategist Agent: Cross-referencing Pillar Two routing...", icon: Network, color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/30" },
    { text: "Synthesis Agent: Generating unified strategic response...", icon: Sparkles, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10", border: "border-[#D4AF37]/30" },
  ];

  return (
    <div className="flex flex-col gap-4 font-mono text-[11px] p-2">
      <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-3 text-[#D4AF37]">
        <Network size={16} className="animate-pulse" />
        <span className="font-bold tracking-widest uppercase text-[10px]">AetherQ Multi-Agent Swarm Active</span>
      </div>
      
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {steps.map((item, idx) => {
            if (idx > step) return null;
            
            const isCompleted = idx < step;
            const isActive = idx === step;

            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-3 p-2 rounded-lg border ${isActive ? item.border : 'border-transparent'} ${isActive ? item.bg : ''} transition-all duration-500`}
              >
                <span className={`shrink-0 mt-0.5 p-1 rounded-md ${isActive ? item.bg : 'bg-white/5'} ${isCompleted ? 'text-[#007A4D]' : item.color}`}>
                  {isCompleted ? (
                    <CheckCircle2 size={14} />
                  ) : isActive ? (
                    <item.icon size={14} className="animate-pulse" />
                  ) : (
                    <Loader2 size={14} className="animate-spin text-amber-500" />
                  )}
                </span>
                
                <div className="flex flex-col gap-1 flex-1">
                  <span className={isCompleted ? "text-white/40" : `font-medium ${item.color}`}>
                    {item.text}
                  </span>
                  {isActive && (
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: "100%" }} 
                      transition={{ duration: 1.5, ease: "linear" }}
                      className={`h-0.5 mt-1 rounded-full ${item.bg.replace('/10', '/50')}`} 
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
