"use client";

import { useState } from "react";
import { Calculator, ArrowRight, DollarSign, Percent } from "lucide-react";
import { motion } from "framer-motion";

export function InteractiveCalculator() {
  const [basePrice, setBasePrice] = useState<number>(12000);
  const [discount, setDiscount] = useState<number>(15);
  const [volume, setVolume] = useState<number>(100);

  const discountedPrice = basePrice * (1 - discount / 100);
  const totalValue = discountedPrice * volume;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-2xl border border-emerald-500/20 bg-black/40 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] font-sans max-w-md w-full"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Calculator size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Dynamic Pricing Model</h3>
          <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">Interactive Micro-App</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-white/70 mb-2">
            <span>Base Unit Price</span>
            <span className="font-mono text-[#D4AF37]">${basePrice.toLocaleString()}</span>
          </label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="range" 
              min="5000" max="50000" step="500"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center justify-between text-xs font-medium text-white/70 mb-2">
            <span>Volume Discount</span>
            <span className="font-mono text-[#D4AF37]">{discount}%</span>
          </label>
          <div className="relative">
            <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="range" 
              min="0" max="50" step="1"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center justify-between text-xs font-medium text-white/70 mb-2">
            <span>License Volume</span>
            <span className="font-mono text-[#D4AF37]">{volume.toLocaleString()} units</span>
          </label>
          <input 
            type="range" 
            min="10" max="1000" step="10"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-[linear-gradient(135deg,rgba(0,96,57,0.2),rgba(212,175,55,0.1))] border border-[#D4AF37]/20 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Projected Total ARR</p>
          <p className="text-2xl font-serif font-bold text-[#E5E4E2]">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-black hover:scale-105 transition shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
