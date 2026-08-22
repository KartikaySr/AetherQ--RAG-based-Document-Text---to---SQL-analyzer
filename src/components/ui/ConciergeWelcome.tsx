"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ShieldCheck, Sparkles, Database, ChevronRight } from "lucide-react";

export function ConciergeWelcome() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("aetherq_concierge_seen");
    if (!hasSeenWelcome) {
      // Small delay for dramatic effect
      const t = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("aetherq_concierge_seen", "true");
  };

  const nextStep = () => {
    if (step === 2) {
      handleComplete();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const steps = [
    {
      title: "Welcome to AetherQ",
      description: "The world's most advanced luxury intelligence platform. Your private data is now fully integrated.",
      icon: ShieldCheck,
      color: "text-[#D4AF37]",
      bg: "bg-[#D4AF37]/10"
    },
    {
      title: "Executive Command",
      description: "Your personalized Bento Box dashboard gives you a real-time pulse on global telemetry and anomalies.",
      icon: Database,
      color: "text-[#007A4D]",
      bg: "bg-[#007A4D]/10"
    },
    {
      title: "Meet Your Copilot",
      description: "Hit ⌘K anywhere to summon the multi-agent swarm. Ask a question, and watch it mathematically verify the truth.",
      icon: Sparkles,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030604]/80 backdrop-blur-3xl p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-black/60 border border-[#D4AF37]/30 rounded-3xl shadow-[0_0_80px_-15px_rgba(212,175,55,0.15)] overflow-hidden"
          >
            {/* Glowing top edge */}
            <div className="h-1 w-full bg-[linear-gradient(90deg,transparent,#D4AF37,transparent)] opacity-50" />
            
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className={`w-20 h-20 rounded-2xl ${steps[step].bg} ${steps[step].color} border border-current/20 flex items-center justify-center mb-6 shadow-inner`}>
                    {steps[step].icon && (() => {
                      const Icon = steps[step].icon;
                      return <Icon size={40} strokeWidth={1.5} />;
                    })()}
                  </div>
                  
                  <h2 className="text-2xl font-serif font-bold text-white mb-3 tracking-tight">
                    {steps[step].title}
                  </h2>
                  <p className="text-white/60 leading-relaxed text-sm">
                    {steps[step].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 flex flex-col gap-4">
                <div className="flex gap-2 justify-center">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-6 bg-[#D4AF37]' : 'w-1.5 bg-white/20'}`} 
                    />
                  ))}
                </div>
                
                <button
                  onClick={nextStep}
                  className="w-full py-4 mt-2 bg-[linear-gradient(110deg,#007A4D_0%,#014026_100%)] hover:opacity-90 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-opacity border border-[#D4AF37]/20 shadow-lg group"
                >
                  {step === 2 ? "Initialize OS" : "Continue"}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
