"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

type Row = Record<string, unknown>;

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function TableSkeleton({ columns = 5, rows = 6 }: { columns?: number; rows?: number }) {
  return (
    <div className="mt-4 space-y-2" aria-busy="true" aria-label="Loading table">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-2"
        >
          {Array.from({ length: columns }).map((__, j) => (
            <div
              key={j}
              className="h-8 flex-1 animate-pulse rounded-lg bg-white/10"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/45">
      No rows matched this warehouse query yet.
    </div>
  );
}

type DataTableProps = {
  rows: Row[];
  /** When true shows skeleton chips */
  isLoading?: boolean;
  caption?: string;
};

export function DataTable({ rows, isLoading, caption }: DataTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!rows.length) {
    return <EmptyState />;
  }

  const { setCopilotOpen, setCopilotContext } = useWorkspaceStore();
  const keys = Object.keys(rows[0]);

  return (
    <figure className="mt-4 space-y-2">
      {caption ? (
        <figcaption className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          {caption}
        </figcaption>
      ) : null}
      <div className="relative overflow-x-auto rounded-2xl border border-white/10 bg-black/35 shadow-inner shadow-black/40">
        <div className="max-h-[min(60vh,520px)] overflow-y-auto overscroll-contain">
          <table className="min-w-full caption-bottom text-left text-[11px] text-white/80">
            <thead className="sticky top-0 z-10 border-b border-white/10 bg-[#071018]/96 backdrop-blur-md">
              <tr>
                {keys.map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="whitespace-nowrap px-3 py-2.5 font-semibold text-emerald-200/90"
                  >
                    {key.replace(/_/g, " ")}
                  </th>
                ))}
                <th scope="col" className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, ri) => (
                <motion.tr
                  key={ri}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(ri * 0.018, 0.35), duration: 0.28 }}
                  className="group transition hover:bg-white/[0.045]"
                >
                  {keys.map((key) => (
                    <td
                      key={key}
                      className="max-w-[min(480px,80vw)] px-3 py-2 align-top font-mono text-[10px] text-white/70 sm:text-[11px]"
                      title={formatCell(row[key])}
                    >
                      <span className="block max-w-xl truncate whitespace-nowrap md:max-w-none md:whitespace-normal md:break-words">
                        {formatCell(row[key])}
                      </span>
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => {
                        setCopilotContext(`Explain this data point: ${JSON.stringify(row)}`);
                        setCopilotOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 border border-emerald-400/30 shadow-emerald-facet"
                      title="Ask AI about this row"
                    >
                      <Sparkles size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </figure>
  );
}
