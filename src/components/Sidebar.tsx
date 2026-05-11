import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl p-6">
      <h1 className="text-4xl font-bold mb-2">AetherQ</h1>
      <p className="text-white/40 mb-10">Mindineers Labs</p>
      <nav className="space-y-4">
        <Link
          href="/chat"
          className="block p-4 rounded-2xl border border-cyan-500/20 bg-white/[0.03] hover:bg-white/[0.06]"
        >
          AI Workspace
        </Link>
        <Link
          href="/analytics"
          className="block p-4 rounded-2xl border border-purple-500/20 bg-white/[0.03] hover:bg-white/[0.06]"
        >
          Enterprise Analytics
        </Link>
        <Link
          href="/documents"
          className="block p-4 rounded-2xl border border-pink-500/20 bg-white/[0.03] hover:bg-white/[0.06]"
        >
          Document Intelligence
        </Link>
      </nav>
    </aside>
  );
}
