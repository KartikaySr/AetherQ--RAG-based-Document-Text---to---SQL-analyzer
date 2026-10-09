"use client";
import { useEffect, useRef } from "react";
import { X, Plug } from "lucide-react";
export function IntegrationsModal({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} className="m-auto w-[calc(100%_-_2rem)] max-w-lg rounded-xl border border-white/15 bg-[#14181d] p-0 text-white backdrop:bg-[#0f1216]/70">
    <div className="flex justify-between items-center p-6 border-b border-white/10"><div><p className="stack-eyebrow">Extensions</p><h2 className="text-xl font-semibold">Connect your workspace</h2></div><button aria-label="Close integrations" onClick={onClose}><X size={20} /></button></div>
    <div className="p-6 space-y-4"><p className="text-sm text-slate-400">Messaging integrations are planned. No external account is connected and no data is shared.</p>{["Slack", "Microsoft Teams"].map(name => <div key={name} className="stack-panel p-4 flex items-center gap-4"><Plug size={20} /><span className="flex-1">{name}</span><span className="stack-tag">Not available</span></div>)}</div>
  </dialog>;
}
