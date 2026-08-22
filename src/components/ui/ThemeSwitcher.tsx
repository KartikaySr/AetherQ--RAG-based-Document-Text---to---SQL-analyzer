import { useState, useEffect } from "react";
import { Palette, Check } from "lucide-react";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<"emerald" | "crimson">("emerald");

  useEffect(() => {
    // Read from localStorage on mount
    const saved = localStorage.getItem("aetherq-theme") as "emerald" | "crimson";
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = (newTheme: "emerald" | "crimson") => {
    setTheme(newTheme);
    localStorage.setItem("aetherq-theme", newTheme);
    if (newTheme === "crimson") {
      document.documentElement.setAttribute("data-theme", "crimson");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  return (
    <div className="relative group/theme flex flex-col gap-2">
      <div className="flex items-center gap-3 text-xs font-semibold text-white/40 uppercase tracking-widest pl-2">
        <Palette size={14} />
        Brand Theme
      </div>
      <div className="flex bg-black/40 border border-white/5 p-1 rounded-2xl relative z-10">
        <button
          onClick={() => toggleTheme("emerald")}
          className={`flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-medium transition-all ${
            theme === "emerald" 
              ? "bg-emerald-500/20 text-emerald-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-emerald-500/30"
              : "text-white/40 hover:text-white"
          }`}
        >
          Emerald
        </button>
        <button
          onClick={() => toggleTheme("crimson")}
          className={`flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-medium transition-all ${
            theme === "crimson" 
              ? "bg-rose-500/20 text-rose-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-rose-500/30"
              : "text-white/40 hover:text-white"
          }`}
        >
          Crimson
        </button>
      </div>
    </div>
  );
}
