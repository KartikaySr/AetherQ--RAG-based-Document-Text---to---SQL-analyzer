"use client";

import { motion, Variants } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, BrainCircuit, Database, FileText, Sparkles, ShieldCheck, Globe, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeoButton } from "@/components/ui/NeoButton";

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openDocumentation = () => {
    window.open("https://github.com/mindineers/aetherq", "_blank");
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 80, damping: 20 } },
  };

  return (
    <main className="min-h-screen relative selection:bg-emerald-500/30 selection:text-emerald-100">
      
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, -50, 0], y: [0, -50, 80, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{ x: [0, -80, 60, 0], y: [0, 60, -40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-600/15 rounded-full blur-[120px] mix-blend-screen"
        />
      </div>

      {/* Navbar */}
      <header className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-500 shadow-[0_0_20px_rgba(16,185,129,0.4),inset_0_1px_2px_rgba(255,255,255,0.5)] flex items-center justify-center transform group-hover:scale-105 transition-all duration-500">
              <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white/90">AetherQ</h1>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-emerald-400/80">Mindineers Labs</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NeoButton variant="ghost" onClick={openDocumentation} className="hidden md:flex text-sm">
              Documentation
            </NeoButton>
            <NeoButton variant="primary" href="/login?redirect=/workspace/chat">
              Launch Workspace <ArrowRight size={16} />
            </NeoButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-32">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
          
          {/* Left Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full lg:flex-1"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-xs font-semibold uppercase tracking-[0.2em] mb-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <Sparkles size={14} className="text-emerald-400" />
              Intelligence OS
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl lg:text-[7rem] font-bold leading-[0.95] tracking-tighter text-white mb-8">
              Data <br />
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-600 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                Redefined.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-2xl text-white/50 leading-relaxed max-w-2xl font-light">
              AI-powered analytics, conversational reasoning, and document retrieval — fused into a single, luxurious enterprise vault.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-12 flex flex-col sm:flex-row gap-5">
              <NeoButton variant="primary" href="/login?redirect=/workspace/chat" className="px-10 py-5 text-lg">
                Enter AetherQ <ArrowRight size={20} />
              </NeoButton>
              <NeoButton variant="secondary" onClick={scrollToFeatures} className="px-10 py-5 text-lg">
                Explore Core
              </NeoButton>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-20 flex gap-12 border-t border-white/5 pt-10">
              <div>
                <h3 className="text-4xl font-bold text-white mb-2">100<span className="text-emerald-400">+</span></h3>
                <p className="text-xs uppercase tracking-widest text-white/40 font-semibold">Integrations</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-white mb-2">99<span className="text-amber-400">%</span></h3>
                <p className="text-xs uppercase tracking-widest text-white/40 font-semibold">Precision</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-white mb-2">Sub<span className="text-pink-400">1s</span></h3>
                <p className="text-xs uppercase tracking-widest text-white/40 font-semibold">Latency</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Floating Dashboard Preview */}
          <div className="relative w-full lg:flex-1 h-[600px] perspective-1000 hidden md:block">
            <GlassCard className="absolute inset-0 w-full h-full p-8" interactive={false}>
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
              </div>
              
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-inner">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-600 shadow-lg" />
                    <div>
                      <h4 className="font-bold text-lg text-white/90">AetherQ AI</h4>
                      <p className="text-xs text-emerald-400/80 uppercase tracking-wider">Verified Result</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-lg leading-relaxed font-light">
                    "South India generated the highest revenue growth across Q2 with a <span className="text-emerald-300 font-medium">14.2%</span> increase compared to Q1, driven by enterprise software sales."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-400/5 blur-xl group-hover:bg-emerald-400/10 transition-colors" />
                    <Database className="text-emerald-400 mb-6 w-8 h-8 relative z-10" />
                    <h3 className="text-3xl font-bold text-white relative z-10">₹9.4M</h3>
                    <p className="text-xs text-emerald-400/60 uppercase tracking-widest mt-2 relative z-10">Revenue YTD</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-amber-500/10 to-transparent p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-amber-400/5 blur-xl group-hover:bg-amber-400/10 transition-colors" />
                    <ShieldCheck className="text-amber-400 mb-6 w-8 h-8 relative z-10" />
                    <h3 className="text-3xl font-bold text-white relative z-10">Zero</h3>
                    <p className="text-xs text-amber-400/60 uppercase tracking-widest mt-2 relative z-10">Data Breaches</p>
                  </div>
                </div>
              </div>
            </GlassCard>
            
            {/* Floating Orbs for depth */}
            <motion.div 
              animate={{ y: [-20, 20, -20], rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-400 to-amber-500 blur-2xl opacity-40 mix-blend-screen"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="relative z-10 max-w-7xl mx-auto px-6 pb-40">
        <div className="mb-20 text-center md:text-left">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            Core Modules
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Designed for the <br />
            <span className="text-white/40">Intelligent Enterprise.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-auto md:h-[450px]">
          {[
            {
              href: "/login?redirect=/workspace/chat",
              icon: BrainCircuit,
              color: "text-emerald-400",
              bg: "from-emerald-500/20",
              shadow: "shadow-emerald-500/20",
              title: "AI Workspace",
              desc: "Conversational enterprise intelligence capable of reasoning, analytics, and autonomous interaction.",
            },
            {
              href: "/login?redirect=/workspace/analytics",
              icon: Database,
              color: "text-amber-400",
              bg: "from-amber-500/20",
              shadow: "shadow-amber-500/20",
              title: "Data Analytics",
              desc: "Real-time dashboards, audited SQL querying, and AI-driven warehouse insights.",
            },
            {
              href: "/login?redirect=/workspace/documents",
              icon: FileText,
              color: "text-pink-400",
              bg: "from-pink-500/20",
              shadow: "shadow-pink-500/20",
              title: "Document Vault",
              desc: "Upload PDFs and retrieve contextual AI-powered insights using advanced RAG architecture.",
            }
          ].map((feature, idx) => (
            <GlassCard key={idx} href={feature.href} className="p-10 flex flex-col justify-between group">
              <div>
                <div className={`w-20 h-20 rounded-[24px] bg-gradient-to-br ${feature.bg} to-transparent border border-white/10 flex items-center justify-center mb-10 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className={`w-10 h-10 ${feature.color} drop-shadow-md`} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-white/50 text-lg leading-relaxed font-light">
                  {feature.desc}
                </p>
              </div>
              <div className={`mt-10 flex items-center gap-2 font-semibold ${feature.color} group-hover:translate-x-2 transition-transform duration-300`}>
                Launch Module <ChevronRight size={20} />
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Footer Strip */}
      <section className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-3xl py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-12 justify-between items-center text-sm font-medium uppercase tracking-widest text-white/30">
          <div className="flex items-center gap-4 hover:text-emerald-400 transition-colors">
            <Globe size={20} /> Global Ready
          </div>
          <div className="flex items-center gap-4 hover:text-amber-400 transition-colors">
            <ShieldCheck size={20} /> Secure Infra
          </div>
          <div className="flex items-center gap-4 hover:text-pink-400 transition-colors">
            <Sparkles size={20} /> Autonomous Layer
          </div>
        </div>
      </section>

    </main>
  );
}
