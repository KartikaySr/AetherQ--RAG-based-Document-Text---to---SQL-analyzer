"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Files, Database, MessageSquare, Layers3, Plus, Clock3, RotateCw } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { conversationService, type ConversationSummary } from "@/services/conversationService";
const modules = [
  { n:"01", name:"Documents", label:"KNOWLEDGE LAYER", icon:Files, color:"#bac7ff", href:"/workspace/documents", text:"Turn source material into searchable knowledge.", tags:["PDF / DOCX", "Cited answers"], action:"Manage sources" },
  { n:"02", name:"Analytics", label:"DATA LAYER", icon:Database, color:"#e8cf9f", href:"/workspace/analytics", text:"Ask a business question. Explore the data behind it.", tags:["Natural language SQL", "Charts"], action:"Explore analytics" },
  { n:"03", name:"Assistant", label:"REASONING LAYER", icon:MessageSquare, color:"#b9edb0", href:"/workspace/chat", text:"Connect the context and keep the conversation moving.", tags:["Conversation history", "Markdown"], action:"Start a conversation" },
];
export default function WorkspacePage() {
  const { user, isGuest } = useAuth();
  const [stats,setStats] = useState<{documentCount:number;conversationCount:number}|null>(null);
  const [error,setError] = useState(false); const [revision,setRevision] = useState(0);
  const [recent,setRecent] = useState<ConversationSummary[]>([]);
  useEffect(() => {
    const ctrl = new AbortController(); setError(false);
    fetch("/api/workspace/stats",{signal:ctrl.signal}).then(async r => {if(!r.ok) throw new Error();return r.json();}).then(setStats).catch(() => {if(!ctrl.signal.aborted) setError(true);});
    void conversationService.getConversations().then(list => {if(!ctrl.signal.aborted) setRecent(list.slice(0,4));}).catch(() => {if(!ctrl.signal.aborted) setError(true);});
    return () => ctrl.abort();
  },[revision]);
  const name = isGuest ? "Guest" : user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  return <div className="stack-page">
    <header className="stack-topbar"><span>Workspace <span className="text-slate-600 mx-2">/</span> <span className="text-white">Overview</span></span><span className="stack-tag"><Layers3 size={12}/> Personal stack</span></header>
    <div className="stack-content">
      <div className="flex flex-wrap items-end justify-between gap-5 mb-6"><div><p className="stack-eyebrow mb-3">Your intelligence workspace</p><h1 className="workspace-heading">Workspace overview</h1><p className="text-sm text-slate-400 mt-4">Welcome back, {name}. Pick a layer and get to work.</p></div><Link href="/workspace/documents" className="stack-primary"><Plus size={16}/> Add a source</Link></div>
      <section className="stack-overview-grid mb-8" aria-label="Workspace summary"><div className="stack-panel p-5"><p className="stack-eyebrow">Sources in your vault</p><div className="flex justify-between items-end mt-4"><strong className="text-3xl font-medium tabular-nums">{error ? "—" : stats?.documentCount ?? "…"}</strong><Files className="text-slate-500" size={20}/></div></div><div className="stack-panel p-5"><p className="stack-eyebrow">Saved conversations</p><div className="flex justify-between items-end mt-4"><strong className="text-3xl font-medium tabular-nums">{error ? "—" : stats?.conversationCount ?? "…"}</strong><MessageSquare className="text-slate-500" size={20}/></div></div><div className="stack-panel p-5"><p className="stack-eyebrow">Workspace modules</p><div className="flex justify-between items-end mt-4"><strong className="text-3xl font-medium">03 <span className="text-xs text-slate-500 font-normal">connected by context</span></strong><Layers3 className="text-[#b9edb0]" size={20}/></div></div></section>
      {error && <div role="alert" className="flex items-center gap-3 mb-6 text-sm text-amber-200">Workspace counts are unavailable.<button onClick={() => setRevision(r=>r+1)} className="flex gap-1 items-center underline"><RotateCw size={13}/> Retry</button></div>}
      <div className="flex justify-between items-center mb-4"><h2 className="font-medium">Your stack</h2><span className="stack-eyebrow">Three layers. One workflow.</span></div>
      <section className="workspace-module-grid mb-6" aria-label="Workspace modules">{modules.map(m => <Link key={m.n} href={m.href} className="stack-module group" style={{"--module-color":m.color} as React.CSSProperties}><div className="flex justify-between items-center"><span className="stack-module-icon"><m.icon size={22}/></span><span className="font-mono text-xs text-slate-600">{m.n} <ArrowUpRight className="inline ml-2" size={16}/></span></div><p className="stack-eyebrow mt-5 mb-2" style={{color:m.color}}>{m.label}</p><h3 className="text-xl font-medium">{m.name}</h3><p className="text-sm text-slate-400 mt-3 leading-relaxed min-h-12">{m.text}</p><div className="flex flex-wrap gap-2 mt-5">{m.tags.map(t=><span key={t} className="stack-tag">{t}</span>)}</div><div className="border-t border-white/10 mt-5 pt-4 text-xs flex justify-between items-center">{m.action}<ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/></div></Link>)}</section>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4"><section className="stack-panel"><div className="flex justify-between p-5 border-b border-white/10"><h2 className="text-sm font-medium">Pick up where you left off</h2><Clock3 size={16} className="text-slate-500"/></div>{recent.length ? <ul>{recent.map(c=><li key={c.id}><Link className="flex items-center gap-3 p-5 border-b border-white/5 hover:bg-white/5 text-sm" href={`/workspace/chat?conversation=${encodeURIComponent(c.id)}`}><MessageSquare size={16} className="text-slate-500"/><span className="flex-1 truncate">{c.title}</span><ArrowUpRight size={14}/></Link></li>)}</ul> : <div className="p-7"><p className="text-sm text-slate-400">Your next idea starts here.</p><p className="text-xs text-slate-500 mt-2">Saved conversations will appear in this space.</p><Link href="/workspace/chat" className="inline-flex gap-2 items-center text-xs text-[#b9edb0] mt-5">Open the assistant <ArrowRight size={14}/></Link></div>}</section>
      <section className="stack-panel p-6 stack-grid-surface"><p className="stack-eyebrow mb-3">A simple way to start</p><h2 className="text-lg font-medium max-w-xs">From a document<br/>to a clearer answer.</h2><ol className="mt-5 space-y-4 text-xs text-slate-400">{["Upload a report, brief, or reference file.","Ask a question in the document workspace.","Review the passages behind the answer."].map((t,i)=><li key={t} className="flex gap-3 items-center"><span className="w-5 h-5 border border-white/15 rounded grid place-items-center font-mono text-[10px]">{i+1}</span>{t}</li>)}</ol></section></div>
      <footer className="flex flex-wrap gap-3 justify-between mt-9 text-[11px] text-slate-600"><span>AetherQ / A workspace for connected thinking.</span><span>Documents → Data → Understanding</span></footer>
    </div>
  </div>;
}
