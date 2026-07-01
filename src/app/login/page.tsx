"use client";

import { motion } from "framer-motion";
import { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { Suspense } from "react";

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
    continueAsGuest,
  } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSending, setForgotSending] = useState(false);
  const [showGuestName, setShowGuestName] = useState(false);
  const [guestName, setGuestName] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithPassword(email, password);
      addToast("Signed in successfully", "success");
      router.push(redirect);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setIsOAuthLoading(true);
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      const message = error instanceof Error ? error.message : "OAuth sign in failed";
      addToast(message, "error");
    } finally {
      setIsOAuthLoading(false);
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

  const handleGuestMode = (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = guestName.trim();
    if (!name) {
      addToast("Add your name to continue as guest.", "info");
      return;
    }
    continueAsGuest(name);
    addToast(`Welcome, ${name}. Guest workspace is ready.`, "info");
    router.push(redirect);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          animate={{ x: [0, 80, -40, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[380px] md:w-[520px] h-[380px] md:h-[520px] bg-cyan-500/10 rounded-full blur-[90px]"
        />
        <motion.div
          animate={{ x: [0, -60, 50, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[380px] md:w-[520px] h-[380px] md:h-[520px] bg-purple-500/10 rounded-full blur-[90px]"
        />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      >
        <motion.div
          animate={{ y: [0, -12, 0], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[8%] top-[22%] text-cyan-400/30"
        >
          <FileText className="h-10 w-10" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute left-[10%] bottom-[28%] text-purple-400/30"
        >
          <BarChart3 className="h-11 w-11" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-[18%] bottom-[20%] text-amber-400/25"
        >
          <Zap className="h-9 w-9" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl" />

        <div className="relative bg-[#0a0a0a]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-5 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-200/90">
              Enterprise Intelligence
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg shadow-cyan-500/20" />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            AetherQ
          </h1>
          <p className="text-center text-white/50 text-sm mb-2">
            Secure workspace for chat, documents, and SQL analytics
          </p>
          <p className="text-center text-[11px] text-white/35 mb-8">
            Multi-tenant isolation · Governed warehouse queries
          </p>

          <form onSubmit={handleSignIn} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-cyan-400/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/80">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgot((v) => !v)}
                  className="text-xs text-cyan-400/90 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-cyan-400/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            {showForgot ? (
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-white/70">
                <p className="mb-3 text-xs leading-relaxed text-white/55">
                  We&apos;ll email you a link to set a new password (check spam folders).
                </p>
                <button
                  type="button"
                  onClick={() => void handleForgot()}
                  disabled={forgotSending}
                  className="w-full rounded-lg border border-cyan-500/30 bg-cyan-500/15 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/25 disabled:opacity-50"
                >
                  {forgotSending ? "Sending…" : "Send reset link"}
                </button>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group min-h-[48px]"
            >
              {isLoading ? (
                <>
                  <DotsLoader />
                  <span className="sr-only">Signing in</span>
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/40">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={isOAuthLoading}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-all duration-300 font-medium text-sm"
            >
              {isOAuthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Continue with Google"
              )}
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("github")}
              disabled={isOAuthLoading}
              className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-all duration-300 font-medium text-sm"
            >
              <Code2 className="h-4 w-4 opacity-80" />
              Continue with GitHub
            </button>
            <button
              type="button"
              onClick={() => setShowGuestName(true)}
              className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white py-3 rounded-lg transition-all duration-300 font-medium text-sm"
            >
              <LogIn className="h-4 w-4 opacity-80" />
              Continue as Guest
            </button>
          </div>

          <p className="text-center text-white/60 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>

      {showGuestName ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <motion.form
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onSubmit={handleGuestMode}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl shadow-cyan-500/15"
          >
            <h2 className="text-xl font-semibold text-white">
              Continue as guest
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              Add a display name for this one-time local demo workspace.
            </p>
            <label className="mt-5 block text-sm font-medium text-white/75">
              Your name
            </label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              autoFocus
              maxLength={40}
              placeholder="Guest name"
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60"
            />
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowGuestName(false)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Enter
              </button>
            </div>
          </motion.form>
        </div>
      ) : null}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/50 text-sm">
          Loading…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
