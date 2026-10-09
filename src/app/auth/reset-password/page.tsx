"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return <main className="min-h-screen grid place-items-center p-6"><form className="stack-panel p-8 w-full max-w-md space-y-5" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError("");
    try { const { error } = await createClient().auth.updateUser({ password });
      if (error) throw error; router.replace("/workspace");
    } catch { setError("Could not update your password. Request a new recovery link and try again."); }
    finally { setBusy(false); }
  }}><h1 className="text-2xl font-semibold">Set a new password</h1><label className="block">New password<input required minLength={12} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full mt-2 border border-white/20 rounded-lg p-3" /></label><p className="text-sm text-white/60">Use at least 12 characters.</p>{error && <p role="alert">{error}</p>}<button disabled={busy} className="stack-primary">{busy ? "Saving…" : "Update password"}</button></form></main>;
}
