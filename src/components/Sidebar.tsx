"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Sparkles, Database, FileText, Shield, Zap, Webhook, Palette } from "lucide-react";
import { IntegrationsModal } from "@/components/ui/IntegrationsModal";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { NeoButton } from "./ui/NeoButton";

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
      href: "/workspace", 
      icon: LayoutDashboard, 
      label: "Command Center", 
      activeBorder: "border-[#1F1F1F]",
      activeBg: "bg-[#141414]",
      activeText: "text-[#D4AF37]",
      hoverText: "group-hover:text-white"
    },
    { 
      href: "/workspace/analytics", 
      icon: Database, 
      label: "Data Analytics", 
      activeBorder: "border-[#1F1F1F]",
      activeBg: "bg-[#141414]",
      activeText: "text-[#D4AF37]",
      hoverText: "group-hover:text-white"
    },
    { 
      href: "/workspace/documents", 
      icon: FileText, 
      label: "Document Vault", 
      activeBorder: "border-[#1F1F1F]",
      activeBg: "bg-[#141414]",
      activeText: "text-[#D4AF37]",
      hoverText: "group-hover:text-white"
    },
    { 
      href: "/workspace/chat", 
      icon: Sparkles, 
      label: "AI Workspace", 
      activeBorder: "border-[#1F1F1F]",
      activeBg: "bg-[#141414]",
      activeText: "text-[#D4AF37]",
      hoverText: "group-hover:text-white"
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-[#0A0A0A] border-r border-[#1F1F1F] p-5 relative z-50 my-3 ml-3 rounded-2xl shadow-xl">

      {/* Logo and Alerts */}
      <div className="mb-10 pl-2 flex justify-between items-start">
        <Link href="/workspace" className="block group">
          <h1 className="text-3xl font-serif font-bold mb-0.5 tracking-tight luxury-text-gradient group-hover:brightness-110 transition-all">
            AetherQ
          </h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]/70">Mindineers Labs</p>
        </Link>

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
              className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 relative z-10 ${
                active
                  ? `${item.activeBorder} ${item.activeBg} text-white shadow-sm`
                  : "border-transparent text-[#A0A0A0] hover:text-white hover:bg-[#141414]/50"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#D4AF37] rounded-r-full`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? item.activeText : `text-[#666666] ${item.hoverText}`}`} />
              <span className={`font-medium text-[13px] tracking-wide ${active ? "text-white" : "text-[#A0A0A0] group-hover:text-white"}`}>
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
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0F0F0F] border border-[#1F1F1F] mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#141414] flex items-center justify-center text-sm font-serif font-bold text-[#D4AF37] border border-[#2A2A2A]">
                {((isGuest ? guestName : user?.email)?.[0] ?? "G").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate">
                  {isGuest ? guestName || "Guest" : user?.email?.split("@")[0]}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-[#666666] truncate mt-0.5">
                  {isGuest ? "Guest Session" : "Verified"}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <NeoButton 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full text-[#A0A0A0] border border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#141414] hover:text-white font-semibold rounded-xl"
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
