"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Sparkles } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();
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

  return (
    <aside className="hidden lg:flex flex-col w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl p-6">
      {/* Logo */}
      <div className="mb-10">
        <Link href="/workspace" className="block group">
          <h1 className="text-4xl font-bold mb-2 group-hover:text-cyan-300 transition-colors">
            AetherQ
          </h1>
          <p className="text-white/40">Mindineers Labs</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        <Link
          href="/workspace"
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
            pathname === "/workspace"
              ? "border-cyan-500/50 bg-cyan-500/10 border-l-4 border-l-cyan-400 pl-3"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
          }`}
        >
          <LayoutDashboard className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>Overview</span>
        </Link>
        <Link
          href="/workspace/chat"
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
            isActive("/workspace/chat")
              ? "border-cyan-500/50 bg-cyan-500/10 border-l-4 border-l-cyan-400 pl-3"
              : "border-cyan-500/20 bg-white/[0.03] hover:bg-white/[0.06]"
          }`}
        >
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>AI Workspace</span>
        </Link>
        <Link
          href="/workspace/analytics"
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
            isActive("/workspace/analytics")
              ? "border-purple-500/50 bg-purple-500/10 border-l-4 border-l-purple-400 pl-3"
              : "border-purple-500/20 bg-white/[0.03] hover:bg-white/[0.06]"
          }`}
        >
          <span className="text-lg" aria-hidden>
            📊
          </span>
          <span>Enterprise Analytics</span>
        </Link>
        <Link
          href="/workspace/documents"
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
            isActive("/workspace/documents")
              ? "border-pink-500/50 bg-pink-500/10 border-l-4 border-l-pink-400 pl-3"
              : "border-pink-500/20 bg-white/[0.03] hover:bg-white/[0.06]"
          }`}
        >
          <span className="text-lg" aria-hidden>
            📄
          </span>
          <span>Document Intelligence</span>
        </Link>
      </nav>

      {/* User Section */}
      {!isLoading && (
        <div className="border-t border-white/10 pt-6 space-y-4">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                {(user.email?.[0] ?? "?").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-white/40 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/20 text-red-400 font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}

