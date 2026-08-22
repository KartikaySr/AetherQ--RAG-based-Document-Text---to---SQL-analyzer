import { Shield, Fingerprint, Lock, Activity } from "lucide-react";
import { format } from "date-fns";

const AUDIT_LOGS = [
  {
    id: "evt_1a2b3c",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    actor: "Admin (Executive)",
    action: "READ_REVENUE_METRICS",
    status: "SUCCESS",
    ip: "192.168.1.104",
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    id: "evt_4d5e6f",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    actor: "System AI",
    action: "GENERATE_SONAR_ALERT",
    status: "SUCCESS",
    ip: "Internal",
    hash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
  },
  {
    id: "evt_7g8h9i",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hrs ago
    actor: "Data Engineer",
    action: "UPDATE_SCHEMA_DEFINITION",
    status: "SUCCESS",
    ip: "10.0.0.42",
    hash: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
  },
  {
    id: "evt_0j1k2l",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hrs ago
    actor: "Unknown User",
    action: "ACCESS_DENIED_CLASSIFIED_DOC",
    status: "FAILED",
    ip: "203.0.113.19",
    hash: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
  },
  {
    id: "evt_3m4n5o",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    actor: "Admin (Executive)",
    action: "LOGIN",
    status: "SUCCESS",
    ip: "192.168.1.104",
    hash: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
  }
];

export default function AuditPage() {
  return (
    <div className="flex h-full flex-col bg-transparent p-6 text-[#E5E4E2] font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-wider text-white">Immutable Audit Ledger</h1>
          <p className="mt-2 text-sm text-white/50">
            Cryptographically verifiable record of all system events. Compliant with SOC2 and ISO27001.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-emerald-400">
            <Shield size={16} />
            <span className="text-xs font-bold tracking-wider uppercase">Ledger Intact</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-[#D4AF37]">
            <Lock size={16} />
            <span className="text-xs font-bold tracking-wider uppercase">End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-[24px] border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-black/80 backdrop-blur-xl z-10 text-xs font-semibold uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-6 py-4 font-medium border-b border-white/10">Timestamp</th>
              <th className="px-6 py-4 font-medium border-b border-white/10">Actor</th>
              <th className="px-6 py-4 font-medium border-b border-white/10">Action</th>
              <th className="px-6 py-4 font-medium border-b border-white/10">Status</th>
              <th className="px-6 py-4 font-medium border-b border-white/10">IP Address</th>
              <th className="px-6 py-4 font-medium border-b border-white/10">SHA-256 Signature</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {AUDIT_LOGS.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition">
                <td className="px-6 py-4 whitespace-nowrap text-white/70">
                  {format(log.timestamp, "MMM dd, yyyy HH:mm:ss")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-white/90">
                  {log.actor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[#D4AF37]/70" />
                    <span className="text-[#D4AF37]/90 text-xs font-mono">{log.action}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold tracking-widest uppercase ${
                    log.status === "SUCCESS" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white/50 font-mono text-xs">
                  {log.ip}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <Fingerprint size={14} className="text-white/30 shrink-0" />
                    <span className="text-white/40 font-mono text-xs truncate" title={log.hash}>
                      {log.hash}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
