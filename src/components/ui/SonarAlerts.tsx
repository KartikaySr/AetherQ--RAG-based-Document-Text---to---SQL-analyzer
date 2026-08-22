import { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, TrendingUp, Search, Activity, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/providers/ToastProvider";

const ALERTS = [
  {
    id: 1,
    title: "Anomaly Detected",
    description: "Revenue in EU region dropped 15% in the last 24h.",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    id: 2,
    title: "Insight Generated",
    description: "Cloud cost optimization could save $2.4k this month.",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    id: 3,
    title: "New Data Available",
    description: "Q3 Marketing Spend tables have been synced.",
    icon: Search,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
];

export function SonarAlerts() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [alerts, setAlerts] = useState(ALERTS);
  const { addToast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);
  const [investigatingId, setInvestigatingId] = useState<number | null>(null);

  const handleInvestigate = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setInvestigatingId(id);
    addToast("Initiating AI root cause analysis...", "info");
    
    setTimeout(() => {
      setAlerts(prev => prev.map(a => 
        a.id === id 
          ? { 
              ...a, 
              title: "Analysis Complete",
              description: a.description + "\n\n[ROOT CAUSE]: Correlated with an unoptimized JOIN query deployed at 02:00 UTC.",
              color: "text-[#D4AF37]",
              bg: "bg-[#D4AF37]/10"
            } 
          : a
      ));
      setInvestigatingId(null);
      addToast("Root cause analysis complete", "success");
    }, 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Simulate proactive Sonar pings
    const interval = setInterval(() => {
      const newAlert = {
        id: Date.now(),
        title: "Anomaly Detected",
        description: `Unusual spike in database queries detected.`,
        icon: Activity,
        color: "text-rose-400",
        bg: "bg-rose-500/10",
      };
      setAlerts((prev) => [newAlert, ...prev]);
      setHasUnread(true);
      addToast("New Sonar Insight available", "success");
    }, 45000); // 45 seconds

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, [addToast]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasUnread(false);
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition"
      >
        <Bell size={18} />
        {hasUnread && (
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            className="absolute left-0 mt-2 w-80 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
              <span className="font-semibold text-sm text-white">Sonar Alerts</span>
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Proactive</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
                >
                  <div className={`mt-0.5 shrink-0 rounded-lg p-2 ${alert.bg} ${alert.color}`}>
                    <alert.icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/90">{alert.title}</h4>
                    <p className="mt-1 text-xs text-white/50 leading-relaxed whitespace-pre-wrap">{alert.description}</p>
                    
                    {alert.title === "Anomaly Detected" && (
                      <button
                        onClick={(e) => handleInvestigate(alert.id, e)}
                        disabled={investigatingId === alert.id}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-white/60 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
                      >
                        {investigatingId === alert.id ? (
                          <><Loader2 size={12} className="animate-spin" /> Analyzing...</>
                        ) : (
                          <><Search size={12} /> Investigate Root Cause</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 bg-white/5">
              <button className="w-full py-2 text-xs font-medium text-white/50 hover:text-white transition rounded-lg hover:bg-white/5">
                View All Insights
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
