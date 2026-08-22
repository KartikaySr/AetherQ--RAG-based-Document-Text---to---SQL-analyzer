"use client";

import { motion } from "framer-motion";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  FileText,
  BarChart3,
  Zap,
  Code2,
  LogIn,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeoButton } from "@/components/ui/NeoButton";

function DotsLoader() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-white"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/workspace";
  const {
    signInWithPassword,
    signInWithOAuth,
    resetPasswordForEmail,
    signInAsGuest,
  } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSending, setForgotSending] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithPassword(email, password);
      addToast("Signed in successfully", "success");
      window.location.href = redirect;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    setIsLoading(true);
    try {
      await signInAsGuest();
      addToast("Signed in as guest", "success");
      window.location.href = redirect;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Guest authentication failed";
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };



  const handleForgot = async () => {
    if (!email.trim()) {
      addToast("Enter your email above first.", "info");
      return;
    }
    setForgotSending(true);
    try {
      await resetPasswordForEmail(email.trim());
      addToast("Check your inbox for a reset link.", "success");
      setShowForgot(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not send reset email";
      addToast(message, "error");
    } finally {
      setForgotSending(false);
    }
  };



  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-100">
      
      {/* Background Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 80, -40, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{ x: [0, -60, 50, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[120px] mix-blend-screen"
        />
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      >
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[12%] top-[20%] text-emerald-400"
        >
          <FileText className="h-16 w-16 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -5, 5, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute left-[12%] bottom-[25%] text-amber-400"
        >
          <BarChart3 className="h-20 w-20 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative z-10 w-full max-w-[440px] perspective-1000"
      >
        <GlassCard className="p-8 md:p-10" interactive={true}>
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-500 shadow-[0_0_30px_rgba(16,185,129,0.5),inset_0_1px_2px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-1 text-white tracking-tight">
            AetherQ Vault
          </h1>
          <p className="text-center text-white/50 text-sm mb-8 font-light">
            Authenticate to access intelligence.
          </p>

          <form onSubmit={handleAuth} className="space-y-5 mb-8">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-white/70 ml-1">
                Enterprise Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-400/50 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[13px] font-medium text-white/70">Vault Key</label>
                <button
                  type="button"
                  onClick={() => setShowForgot((v) => !v)}
                  className="text-xs text-emerald-400/80 hover:text-emerald-300 transition-colors"
                >
                  Forgot Key?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-400/50 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            {showForgot && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm backdrop-blur-md"
              >
                <p className="mb-3 text-xs leading-relaxed text-white/70">
                  We'll transmit a secure reset link to your email.
                </p>
                <NeoButton
                  type="button"
                  onClick={() => void handleForgot()}
                  disabled={forgotSending}
                  variant="secondary"
                  className="w-full py-2"
                >
                  {forgotSending ? "Transmitting..." : "Send Link"}
                </NeoButton>
              </motion.div>
            )}

            <NeoButton
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full mt-2"
            >
              {isLoading ? <DotsLoader /> : "Authorize Access"}
            </NeoButton>
            
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-white/30 text-xs">or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <NeoButton
              type="button"
              onClick={handleGuest}
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              Continue as Guest
            </NeoButton>
          </form>

          <p className="text-center text-white/40 text-sm mt-8">
            No clearance?{" "}
            <Link
              href="/signup"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Request Access
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-emerald-500 text-sm font-semibold tracking-widest uppercase">
          Initializing Vault...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
