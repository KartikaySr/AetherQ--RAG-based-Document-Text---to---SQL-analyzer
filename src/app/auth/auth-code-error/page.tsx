import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-[100dvh] bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-white mb-3">Sign-in could not complete</h1>
      <p className="text-white/55 max-w-md mb-8 text-sm leading-relaxed">
        The OAuth or email link may have expired, or the redirect URL may not match
        what is configured in your Supabase project. Check Supabase Authentication → URL
        configuration and try again.
      </p>
      <Link
        href="/login"
        className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-95 transition"
      >
        Back to sign in
      </Link>
    </div>
  );
}
