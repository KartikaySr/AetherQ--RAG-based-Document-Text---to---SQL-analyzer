"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Command, Mic, Search, FileText, LayoutDashboard, MessageSquare, Terminal, Settings } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  type: "navigate" | "action" | "document" | "ai";
  icon: React.ElementType;
  href?: string;
  action?: () => void;
};

const GLOBAL_COMMANDS: SearchResult[] = [
  { id: "nav-dash", title: "Executive Dashboard", subtitle: "Command Center", type: "navigate", icon: LayoutDashboard, href: "/workspace/dashboard" },
  { id: "nav-chat", title: "AetherQ Intelligence", subtitle: "Start a new conversation", type: "navigate", icon: MessageSquare, href: "/workspace/chat" },
  { id: "nav-term", title: "Multi-Agent Terminal", subtitle: "System Operations", type: "navigate", icon: Terminal, href: "/workspace/terminal" },
  { id: "nav-set", title: "System Preferences", type: "navigate", icon: Settings, href: "/workspace/settings" },
  
  { id: "doc-1", title: "Q3 Financial Projections.pdf", subtitle: "Last edited 2h ago", type: "document", icon: FileText },
  { id: "doc-2", title: "Enterprise Architecture Review.docx", subtitle: "Last edited yesterday", type: "document", icon: FileText },
  { id: "doc-3", title: "Global Expansion Strategy", subtitle: "Active Node", type: "document", icon: FileText },
];

export function GlobalCopilot() {
  const router = useRouter();
  const { isCopilotOpen, setCopilotOpen, copilotContext, setCopilotContext, setPendingGlobalPrompt } = useWorkspaceStore();
  const [input, setInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition();

  useEffect(() => {
    if (transcript) {
      setInput((prev) => {
        const base = prev.replace(/\s+$/, "");
        return base ? `${base} ${transcript}` : transcript;
      });
    }
  }, [transcript]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCopilotOpen(!isCopilotOpen);
      }
      if (e.key === "Escape" && isCopilotOpen) {
        setCopilotOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCopilotOpen, setCopilotOpen]);

  useEffect(() => {
    if (isCopilotOpen) {
      if (copilotContext) setInput(copilotContext);
      else setInput("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isCopilotOpen, copilotContext]);

  const filteredResults = useMemo(() => {
    if (!input.trim()) return GLOBAL_COMMANDS.slice(0, 4); // Default to navs
    const query = input.toLowerCase();
    const results = GLOBAL_COMMANDS.filter(c => c.title.toLowerCase().includes(query) || c.subtitle?.toLowerCase().includes(query));
    
    // Always append the AI fallback action
    results.push({
      id: "ai-fallback",
      title: `Ask AetherQ: "${input}"`,
      subtitle: "Execute via Intelligence Mesh",
      type: "ai",
      icon: Sparkles
    });
    
    return results;
  }, [input]);

  // Handle keyboard navigation for the list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeResult(filteredResults[selectedIndex]);
    }
  };

  const executeResult = (result: SearchResult) => {
    if (!result) return;
    
    if (result.type === "ai") {
      setPendingGlobalPrompt(input.trim());
      router.push("/workspace/chat");
    } else if (result.type === "navigate" && result.href) {
      router.push(result.href);
    } else if (result.type === "action" && result.action) {
      result.action();
    } else if (result.type === "document") {
      // Simulate asking AI to analyze this document
      setPendingGlobalPrompt(`Analyze ${result.title} and provide a summary of key points.`);
      router.push("/workspace/chat");
    }
    
    setCopilotOpen(false);
    setCopilotContext(null);
    setInput("");
  };

  const handleClose = () => {
    setCopilotOpen(false);
    setCopilotContext(null);
  };

  return (
    <AnimatePresence>
      {isCopilotOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              className="w-full max-w-3xl px-4 pointer-events-auto"
            >
              <div className="relative overflow-hidden rounded-[32px] bg-[#030604] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] border border-[#D4AF37]/30 backdrop-blur-3xl">
                
                {/* Ultra Luxury Shimmer */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_70%),radial-gradient(ellipse_at_bottom,rgba(0,96,57,0.1),transparent_70%)]" />

                <div className="relative border-b border-[#D4AF37]/10 p-2">
                  <div className="flex items-center gap-4 px-6 py-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#006039,#D4AF37)] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_15px_rgba(212,175,55,0.2)] border border-[#D4AF37]/40">
                      <Search size={20} className="text-white" />
                    </div>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        setSelectedIndex(0); // reset selection
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Search files, navigate, or ask AetherQ..."
                      className="flex-1 bg-transparent text-2xl font-serif text-[#E5E4E2] placeholder-white/20 outline-none tracking-tight"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 border border-[#D4AF37]/10 ${
                          isListening
                            ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse"
                            : "bg-white/5 text-[#D4AF37]/50 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
                        }`}
                      >
                        <Mic size={18} className={isListening ? "animate-bounce" : ""} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Search Results */}
                <div className="max-h-[50vh] overflow-y-auto p-4 custom-scrollbar">
                  {filteredResults.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {filteredResults.map((result, idx) => {
                        const isSelected = idx === selectedIndex;
                        const Icon = result.icon;
                        return (
                          <div
                            key={result.id}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            onClick={() => executeResult(result)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? "bg-[#D4AF37]/10 border border-[#D4AF37]/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                                : "bg-transparent border border-transparent hover:bg-white/5"
                            }`}
                          >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              isSelected
                                ? (result.type === 'ai' ? 'bg-[#D4AF37] text-[#030604]' : 'bg-[#006039] text-[#D4AF37]')
                                : 'bg-white/5 text-white/40'
                            }`}>
                              <Icon size={18} className={result.type === 'ai' && isSelected ? 'animate-pulse' : ''} />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className={`text-[15px] font-medium truncate ${isSelected ? 'text-white' : 'text-[#E5E4E2]'}`}>
                                {result.title}
                              </span>
                              {result.subtitle && (
                                <span className={`text-xs truncate ${isSelected ? 'text-[#D4AF37]/80' : 'text-white/40'}`}>
                                  {result.subtitle}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]/50">
                                <span>Press Enter</span>
                                <ArrowRight size={12} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-white/30">
                      <Sparkles size={32} className="mb-4 opacity-20" />
                      <p>No intelligent matches found.</p>
                    </div>
                  )}
                </div>

                {/* Footer hints */}
                <div className="border-t border-[#D4AF37]/10 bg-black/40 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[10px] font-medium text-white/40">
                    <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 py-0.5 rounded">↑</kbd><kbd className="bg-white/10 px-1.5 py-0.5 rounded">↓</kbd> to navigate</span>
                    <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 py-0.5 rounded">↵</kbd> to execute</span>
                    <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 py-0.5 rounded">esc</kbd> to close</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#D4AF37]/30">
                    AetherQ Global Search
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
