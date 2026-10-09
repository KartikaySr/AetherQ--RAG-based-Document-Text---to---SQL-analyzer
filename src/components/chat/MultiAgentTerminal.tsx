import { Loader2 } from "lucide-react";
export function MultiAgentTerminal() {
  return <div role="status" className="flex items-center gap-3 p-4 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Waiting for the model’s response…</div>;
}
