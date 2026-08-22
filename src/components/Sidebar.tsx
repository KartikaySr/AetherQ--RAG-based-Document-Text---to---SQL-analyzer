"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Sparkles, Database, FileText, Shield, Zap, Webhook, Palette } from "lucide-react";
import { IntegrationsModal } from "@/components/ui/IntegrationsModal";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { NeoButton } from "./ui/NeoButton";
import { SonarAlerts } from "./ui/SonarAlerts";

import { motion } from "framer-motion";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showIntegrations, setShowIntegrations] = useState(false);
  const { user, guestName, signOut, isLoading, isGuest } = useAuth();
  const { addToast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      addToast("Signed out successfully", "success");
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign out failed";
      addToast(message, "error");
    }
  };

  const isActive = (href: string) => pathname === href;

  const navItems = [
    { 
      href: "/workspace/dashboard", 
      icon: LayoutDashboard, 
      label: "Command Center", 
      activeBorder: "border-purple-500/30",
      activeBg: "bg-purple-500/10",
      activeText: "text-purple-400",
      hoverText: "group-hover:text-purple-300",
      indicatorColor: "bg-purple-400",
      shadowLight: "rgba(168,85,247,0.1)",
      shadowStrong: "rgba(168,85,247,0.5)",
      borderColor: "border-purple-500/20"
    },
    { 
      href: "/workspace/assurance", 
      icon: Shield, 
      label: "Continuous Assurance", 
      activeBorder: "border-emerald-500/30",
      activeBg: "bg-emerald-500/10",
      activeText: "text-emerald-400",
      hoverText: "group-hover:text-emerald-300",
      indicatorColor: "bg-emerald-400",
      shadowLight: "rgba(16,185,129,0.1)",
      shadowStrong: "rgba(16,185,129,0.5)",
      borderColor: "border-emerald-500/20"
    },
    { 
      href: "/workspace/mna", 
      icon: Database, 
      label: "M&A Risk Prediction", 
      activeBorder: "border-amber-500/30",
      activeBg: "bg-amber-500/10",
      activeText: "text-amber-400",
      hoverText: "group-hover:text-amber-300",
      indicatorColor: "bg-amber-400",
      shadowLight: "rgba(245,158,11,0.1)",
      shadowStrong: "rgba(245,158,11,0.5)",
      borderColor: "border-amber-500/20"
    },
    { 
      href: "/workspace/tax", 
      icon: Webhook, 
      label: "Dynamic Tax Routing", 
      activeBorder: "border-pink-500/30",
      activeBg: "bg-pink-500/10",
      activeText: "text-pink-400",
      hoverText: "group-hover:text-pink-300",
      indicatorColor: "bg-pink-400",
      shadowLight: "rgba(236,72,153,0.1)",
      shadowStrong: "rgba(236,72,153,0.5)",
      borderColor: "border-pink-500/20"
    },
    { 
      href: "/workspace/documents", 
      icon: FileText, 
      label: "Document Vault", 
      activeBorder: "border-[#D4AF37]/30",
      activeBg: "bg-[#D4AF37]/10",
      activeText: "text-[#D4AF37]",
      hoverText: "group-hover:text-[#E6C875]",
      indicatorColor: "bg-[#D4AF37]",
      shadowLight: "rgba(212,175,55,0.1)",
      shadowStrong: "rgba(212,175,55,0.5)",
      borderColor: "border-[#D4AF37]/20"
    },
    { 
      href: "/workspace/chat", 
      icon: Sparkles, 
      label: "AI Workspace", 
      activeBorder: "border-emerald-500/30",
      activeBg: "bg-emerald-500/10",
      activeText: "text-emerald-400",
      hoverText: "group-hover:text-emerald-300",
      indicatorColor: "bg-emerald-400",
      shadowLight: "rgba(16,185,129,0.1)",
      shadowStrong: "rgba(16,185,129,0.5)",
      borderColor: "border-emerald-500/20"
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[260px] border border-amber-500/10 bg-black/40 backdrop-blur-3xl p-5 relative z-50 my-3 ml-3 rounded-[32px] shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(251,191,36,0.15)]">
      
      {/* Decorative Light */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-emerald-500/10 blur-[100px] pointer-events-none -z-10" />

      {/* Logo and Alerts */}
      <div className="mb-10 pl-2 flex justify-between items-start">
        <Link href="/workspace" className="block group">
          <h1 className="text-3xl font-serif font-bold mb-0.5 tracking-tight luxury-text-gradient group-hover:brightness-110 transition-all">
            AetherQ
          </h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]/70">Mindineers Labs</p>
        </Link>
        <SonarAlerts />
      </div>

      {/* Navigation */}
      <nav className="space-y-3 flex-1 relative">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 p-3 rounded-2xl border transition-colors duration-300 relative z-10 ${
                active
                  ? `${item.activeBorder} text-white`
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className={`absolute inset-0 rounded-2xl ${item.activeBg} -z-10 border ${item.borderColor}`}
                  style={{ boxShadow: `0 0 20px ${item.shadowLight}` }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {active && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#D4AF37] rounded-r-full`}
                  style={{ boxShadow: `0 0 10px rgba(212,175,55,0.5)` }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? item.activeText : `text-white/50 ${item.hoverText}`}`} />
              <span className={`font-semibold text-[13px] tracking-wide ${active ? "text-white" : "text-white/60 group-hover:text-white"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {!isLoading && (
        <div className="pt-6">
          {/* User Info */}
          {(user || isGuest) && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <div className="w-10 h-10 rounded-xl bg-[linear-gradient(135deg,#006039,#D4AF37)] flex items-center justify-center text-sm font-serif font-bold text-white shadow-lg border border-[#D4AF37]/30">
                {((isGuest ? guestName : user?.email)?.[0] ?? "G").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate">
                  {isGuest ? guestName || "Guest" : user?.email?.split("@")[0]}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-white/40 truncate mt-0.5">
                  {isGuest ? "Guest Session" : "Verified"}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <NeoButton 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 font-semibold"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </NeoButton>
        </div>
      )}


      {/* Integrations */}
      <div className="mt-2 flex flex-col gap-2">
        <button 
          onClick={() => setShowIntegrations(true)}
          className="group flex w-full items-center justify-between rounded-xl px-3 py-2 text-white/50 hover:bg-white/5 hover:text-white transition"
        >
          <div className="flex items-center gap-3">
            <Webhook size={18} />
            <span className="text-sm font-medium">Integrations</span>
          </div>
          <div className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            New
          </div>
        </button>
      </div>
      
      {showIntegrations && <IntegrationsModal onClose={() => setShowIntegrations(false)} />}
    </aside>
  );
}
