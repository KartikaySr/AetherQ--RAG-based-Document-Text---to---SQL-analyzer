"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layers3, LayoutGrid, Database, Files, MessageSquare, Plug, LogOut, Menu, X, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { IntegrationsModal } from "@/components/ui/IntegrationsModal";
const items = [
  { href: "/workspace", label: "Overview", icon: LayoutGrid, code: "00" },
  { href: "/workspace/documents", label: "Documents", icon: Files, code: "01" },
  { href: "/workspace/analytics", label: "Analytics", icon: Database, code: "02" },
  { href: "/workspace/chat", label: "Assistant", icon: MessageSquare, code: "03" },
];
export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [integrations, setIntegrations] = useState(false);
  const path = usePathname(); const router = useRouter();
  const { user, isGuest, signOut } = useAuth(); const { addToast } = useToast();
  return <>
    <div className="stack-mobile-bar"><Link href="/workspace" className="flex items-center gap-2 font-semibold"><Layers3 size={21}/> AetherQ</Link><button aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div>
    {open && <button aria-label="Close navigation" className="fixed inset-0 bg-[#0f1216]/70 z-40 lg:hidden" onClick={() => setOpen(false)}/>}
    <aside className={`stack-sidebar ${open ? "is-open" : ""}`}>
      <Link href="/workspace" className="stack-brand"><span className="stack-brand-mark"><Layers3 size={23}/></span>AetherQ<span className="text-xs text-slate-500 ml-auto font-normal">/ stack</span></Link>
      <div className="stack-workspace-switch"><span className="w-7 h-7 rounded-md bg-white/10 grid place-items-center text-xs">{isGuest ? "G" : (user?.email?.[0] || "W").toUpperCase()}</span><div><strong className="text-xs font-medium">{isGuest ? "Guest workspace" : "Personal workspace"}</strong><p className="text-[11px] text-slate-500">Intelligence platform</p></div></div>
      <p className="stack-eyebrow px-3 mb-3">Workspace</p>
      <nav aria-label="Workspace navigation" className="space-y-1">{items.map(({href,label,icon:Icon,code}) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined} className={`stack-nav ${path === href ? "active" : ""}`}><Icon size={17}/><span className="flex-1">{label}</span><span className="text-[10px] font-mono opacity-40">{code}</span></Link>)}</nav>
      <div className="mt-8"><p className="stack-eyebrow px-3 mb-3">Extend</p><button onClick={() => setIntegrations(true)} className="stack-nav w-full"><Plug size={17}/><span className="flex-1 text-left">Integrations</span><span className="stack-tag">Planned</span></button></div>
      <div className="mt-auto pt-8"><div className="border border-white/10 rounded-lg p-4 mb-5"><Layers3 size={18} className="text-[#b9edb0] mb-3"/><p className="text-xs font-medium">One workspace. Three layers.</p><p className="text-xs text-slate-500 mt-2 leading-relaxed">Bring your sources, explore the data, and build understanding.</p><Link href="/workspace/documents" onClick={() => setOpen(false)} className="text-xs mt-3 flex items-center gap-2 text-[#b9edb0]">Add your first source <ArrowUpRight size={13}/></Link></div>
      <div className="flex items-center gap-3 border-t border-white/10 pt-4"><span className="w-8 h-8 bg-white/10 rounded-full grid place-items-center text-xs">{isGuest ? "G" : (user?.email?.[0] || "U").toUpperCase()}</span><span className="flex-1 text-xs truncate text-slate-400">{isGuest ? "Guest session" : user?.email || "Workspace"}</span><button aria-label="Sign out" onClick={async () => { try { await signOut(); router.replace("/login"); } catch { addToast("Sign out failed. Please retry.","error"); } }}><LogOut size={16}/></button></div></div>
    </aside>
    {integrations && <IntegrationsModal onClose={() => setIntegrations(false)}/>}
  </>;
}
