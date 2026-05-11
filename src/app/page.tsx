"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef } from "react";

import {
  ArrowRight,
  BrainCircuit,
  Database,
  FileText,
  Sparkles,
  ShieldCheck,
  BarChart3,
  Globe,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openDocumentation = () => {
    window.open("https://github.com/mindineers/aetherq", "_blank");
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">

        {/* Cyan Glow */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -30, 40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-[-10%] left-[-10%] w-[380px] md:w-[520px] h-[380px] md:h-[520px] bg-cyan-500/10 rounded-full blur-[90px]"
        />

        {/* Purple Glow */}
        <motion.div
          animate={{
            x: [0, -60, 50, 0],
            y: [0, 40, -20, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[380px] md:w-[520px] h-[380px] md:h-[520px] bg-purple-500/10 rounded-full blur-[90px]"
        />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />

      </div>

      {/* Navbar */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[80px] flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg shadow-cyan-500/20" />

            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                AetherQ
              </h1>

              <p className="text-xs md:text-sm text-gray-500">
                by Mindineers Labs
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={openDocumentation}
              className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm transition-all duration-300 hover:bg-white/[0.06] active:scale-95 md:inline-flex md:px-5"
            >
              Documentation
            </button>

            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2.5 text-sm font-medium shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 md:px-5"
            >
              <span className="md:hidden">Workspace</span>
              <span className="hidden md:inline">Launch Workspace</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>

      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-20 md:pt-28 pb-24">

        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

          {/* Left */}
          <div className="w-full lg:flex-1">

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-sm mb-8">

                <Sparkles size={16} />

                Enterprise Intelligence Operating System

              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight">

                Autonomous AI
                <br />

                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  For Enterprise Data
                </span>

              </h1>

              <p className="mt-8 text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl">

                AI-powered analytics, conversational reasoning,
                SQL intelligence, and document retrieval —
                unified into one futuristic enterprise workspace.

              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">

                <Link
                  href="/chat"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:scale-105 transition flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/20"
                >
                  Open AetherQ
                  <ArrowRight size={20} />
                </Link>

                <button
                  onClick={scrollToFeatures}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] transition active:scale-95"
                >
                  Explore Features
                </button>

              </div>

              {/* Stats */}
              <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5">

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

                  <h3 className="text-3xl font-bold text-cyan-400">
                    100+
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    Enterprise Records
                  </p>

                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

                  <h3 className="text-3xl font-bold text-purple-400">
                    AI
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    Powered Workspace
                  </p>

                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

                  <h3 className="text-3xl font-bold text-pink-400">
                    RAG
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    Document Intelligence
                  </p>

                </div>

              </div>

            </motion.div>

          </div>

          {/* Right Preview */}
          <div className="relative w-full lg:flex-1">

            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden shadow-2xl shadow-cyan-500/10"
            >

              {/* Top Bar */}
              <div className="h-14 border-b border-white/10 flex items-center px-5 gap-2">

                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />

              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-5">

                {/* AI Response */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

                  <div className="flex items-center gap-3 mb-4">

                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500" />

                    <div>
                      <h4 className="font-semibold">
                        AetherQ AI
                      </h4>

                      <p className="text-xs text-gray-500">
                        Enterprise Intelligence
                      </p>
                    </div>

                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    South India generated the highest revenue growth
                    across Q2 with a 14.2% increase compared to Q1.
                  </p>

                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-2 gap-4">

                  <div className="rounded-3xl border border-white/10 bg-cyan-500/10 p-5">

                    <BarChart3 className="text-cyan-400 mb-4" />

                    <h3 className="text-2xl font-bold">
                      ₹9.4M
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                      Revenue Analytics
                    </p>

                  </div>

                  <div className="rounded-3xl border border-white/10 bg-purple-500/10 p-5">

                    <ShieldCheck className="text-purple-400 mb-4" />

                    <h3 className="text-2xl font-bold">
                      Secure
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                      Enterprise Grade
                    </p>

                  </div>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </section>

      {/* Features */}
      <section ref={featuresRef} className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-28">

        <div className="flex items-center justify-between mb-12">

          <div>

            <p className="text-cyan-400 text-sm uppercase tracking-[0.3em] mb-4">
              Core Capabilities
            </p>

            <h2 className="text-3xl md:text-5xl font-bold">
              Designed For Intelligent Enterprises
            </h2>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {/* Card 1 */}
          <Link href="/chat">

            <motion.div
              whileHover={{
                y: -6,
                scale: 1.01,
              }}
              className="group rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 hover:border-cyan-500/30 transition min-h-[320px] flex flex-col justify-between"
            >

              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-8">

                <BrainCircuit
                  className="text-cyan-400"
                  size={32}
                />

              </div>

              <h3 className="text-3xl font-semibold mb-5">
                AI Workspace
              </h3>

              <p className="text-gray-400 text-lg leading-relaxed">
                Conversational enterprise intelligence
                capable of reasoning, analytics,
                and autonomous AI interaction.
              </p>

              <div className="mt-8 flex items-center gap-2 text-cyan-400 font-medium">

                Open Workspace

                <ChevronRight size={18} />

              </div>

            </motion.div>

          </Link>

          {/* Card 2 */}
          <Link href="/analytics">

            <motion.div
              whileHover={{
                y: -6,
                scale: 1.01,
              }}
              className="group rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 hover:border-cyan-500/30 transition min-h-[320px] flex flex-col justify-between"
            >

              <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center mb-8">

                <Database
                  className="text-purple-400"
                  size={32}
                />

              </div>

              <h3 className="text-3xl font-semibold mb-5">
                Enterprise Analytics
              </h3>

              <p className="text-gray-400 text-lg leading-relaxed">
                Real-time dashboards, SQL querying,
                business intelligence, and AI-driven
                enterprise insights.
              </p>

              <div className="mt-8 flex items-center gap-2 text-purple-400 font-medium">

                Explore Analytics

                <ChevronRight size={18} />

              </div>

            </motion.div>

          </Link>

          {/* Card 3 */}
          <Link href="/documents">

            <motion.div
              whileHover={{
                y: -6,
                scale: 1.01,
              }}
              className="group rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 hover:border-cyan-500/30 transition min-h-[320px] flex flex-col justify-between"
            >

              <div className="w-16 h-16 rounded-3xl bg-pink-500/10 flex items-center justify-center mb-8">

                <FileText
                  className="text-pink-400"
                  size={32}
                />

              </div>

              <h3 className="text-3xl font-semibold mb-5">
                Document Intelligence
              </h3>

              <p className="text-gray-400 text-lg leading-relaxed">
                Upload enterprise PDFs and retrieve
                contextual AI-powered insights using
                advanced RAG architecture.
              </p>

              <div className="mt-8 flex items-center gap-2 text-pink-400 font-medium">

                Upload Documents

                <ChevronRight size={18} />

              </div>

            </motion.div>

          </Link>

        </div>

      </section>

      {/* Bottom Strip */}
      <section className="relative z-10 border-y border-white/10 bg-white/[0.02] backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 flex flex-wrap gap-8 justify-between items-center">

          <div className="flex items-center gap-3">

            <Globe className="text-cyan-400" />

            <span className="text-gray-300">
              Global Enterprise Ready
            </span>

          </div>

          <div className="flex items-center gap-3">

            <ShieldCheck className="text-purple-400" />

            <span className="text-gray-300">
              Secure AI Infrastructure
            </span>

          </div>

          <div className="flex items-center gap-3">

            <Sparkles className="text-pink-400" />

            <span className="text-gray-300">
              Autonomous Intelligence Layer
            </span>

          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 text-center text-gray-500">

        <p>
          Built by Mindineers Labs • AetherQ v1
        </p>

      </footer>

    </main>
  );
}
