"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Mail, Lock, ArrowRight, Loader2, Code2, 
  User, Building, Users, Briefcase, Shield, Zap, Sparkles 
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

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const capped = Math.min(score, 4);
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-red-500/60",
    "bg-orange-500/60",
    "bg-amber-500/60",
    "bg-emerald-500/70",
    "bg-emerald-500/70",
  ];
  return { score: capped, label: labels[capped], color: colors[capped] };
}

type Tier = "individual" | "startup" | "enterprise";

function SignUpContent() {
  const router = useRouter();
  const { signUp, signInWithOAuth } = useAuth();
  const { addToast } = useToast();

  const [tier, setTier] = useState<Tier>("individual");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (password.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return;
    }

    setIsLoading(true);

    try {
      const metadata: Record<string, any> = { full_name: fullName, tier };
      if (tier === "startup") {
        metadata.company_name = companyName;
        metadata.team_size = teamSize;
      }
      if (tier === "enterprise") {
        metadata.company_name = companyName;
        metadata.job_title = jobTitle;
      }

      await signUp(email, password, metadata);
      addToast("Account created! Welcome to AetherQ.", "success");
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign up failed";
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
      const message = error instanceof Error ? error.message : "OAuth sign up failed";
      addToast(message, "error");
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const InputWrapper = ({ label, icon: Icon, children }: any) => (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-white/70 ml-1">
        {label}
      </label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-400/50 group-focus-within:text-emerald-400 transition-colors" />
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-100 overflow-x-hidden pt-12 pb-12">
      
      {/* Background Lights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative z-10 w-full max-w-[500px] perspective-1000"
      >
        <GlassCard className="p-8 md:p-10" interactive={true}>
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-500 shadow-[0_0_30px_rgba(16,185,129,0.5),inset_0_1px_2px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-1 text-white tracking-tight">
            Request Clearance
          </h1>
          <p className="text-center text-white/50 text-sm mb-8 font-light">
            Join the AetherQ Intelligence Mesh.
          </p>

          <form onSubmit={handleSignUp} className="space-y-6 mb-8">
            {/* Tier Selection */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-white/70 ml-1">
                Select Account Protocol
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "individual", label: "Individual", icon: User },
                    { id: "startup", label: "Startup", icon: Zap },
                    { id: "enterprise", label: "Enterprise", icon: Shield },
                  ] as const
                ).map((t) => {
                  const Icon = t.icon;
                  const isActive = tier === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTier(t.id)}
                      className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
                        isActive
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]"
                          : "bg-black/40 border-white/10 text-white/50 hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "opacity-100" : "opacity-50"}`} />
                      <span className="text-xs font-semibold uppercase tracking-wider">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <InputWrapper label="Full Name" icon={User}>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
                />
              </InputWrapper>

              <AnimatePresence mode="wait">
                {(tier === "startup" || tier === "enterprise") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <InputWrapper label="Company Name" icon={Building}>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Corp"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
                      />
                    </InputWrapper>

                    {tier === "startup" && (
                      <InputWrapper label="Estimated Team Size" icon={Users}>
                        <select
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner appearance-none"
                        >
                          <option value="" disabled className="bg-[#051A11]">Select team size...</option>
                          <option value="1-10" className="bg-[#051A11]">1 - 10 employees</option>
                          <option value="11-50" className="bg-[#051A11]">11 - 50 employees</option>
                          <option value="51-200" className="bg-[#051A11]">51 - 200 employees</option>
                        </select>
                      </InputWrapper>
                    )}

                    {tier === "enterprise" && (
                      <InputWrapper label="Job Title / Department" icon={Briefcase}>
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g. Director of FP&A"
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
                        />
                      </InputWrapper>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <InputWrapper label="Email Address" icon={Mail}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
                />
              </InputWrapper>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-white/70 ml-1">
                  Vault Key (Password)
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-400/50 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
                  />
                </div>
                {password.length > 0 && (
                  <div className="pt-2">
                    <div className="flex h-1 gap-1 w-full max-w-[200px] ml-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 rounded-full transition-colors ${
                            i <= strength.score ? strength.color : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <InputWrapper label="Confirm Vault Key" icon={Lock}>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
                />
              </InputWrapper>
            </div>

            <NeoButton
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full mt-6"
            >
              {isLoading ? <DotsLoader /> : "Initialize Account"}
            </NeoButton>
          </form>

          <p className="text-center text-white/40 text-sm mt-8">
            Already have clearance?{" "}
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Authenticate
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-emerald-500 text-sm font-semibold tracking-widest uppercase">
          Initializing Protocol...
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
