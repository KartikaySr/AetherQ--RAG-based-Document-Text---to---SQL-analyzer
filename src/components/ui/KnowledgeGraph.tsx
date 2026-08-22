"use client";

import { motion } from "framer-motion";
import { Database, Shield, Zap, Sparkles, Server } from "lucide-react";

export function KnowledgeGraph() {
  const nodes = [
    { icon: <Database size={20} />, label: "AetherQ Core", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", delay: 0 },
    { icon: <Shield size={16} />, label: "Security Policy", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", delay: 0.2 },
    { icon: <Zap size={16} />, label: "Fast Retrieval", color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30", delay: 0.4 },
    { icon: <Sparkles size={16} />, label: "LLM Agent", color: "text-pink-400", bg: "bg-pink-500/20", border: "border-pink-500/30", delay: 0.6 },
    { icon: <Server size={16} />, label: "Data Warehouse", color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", delay: 0.8 },
  ];

  return (
    <div className="relative w-full max-w-sm h-72 mx-auto my-6 bg-black/40 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-xl flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#444_1px,transparent_1px),linear-gradient(to_bottom,#444_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      {/* Central Node */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`absolute z-20 flex flex-col items-center justify-center w-24 h-24 rounded-full border ${nodes[0].border} ${nodes[0].bg} backdrop-blur-md shadow-[0_0_30px_rgba(52,211,153,0.3)]`}
      >
        <div className={nodes[0].color}>{nodes[0].icon}</div>
        <span className="text-[10px] font-bold mt-1 text-white/80">{nodes[0].label}</span>
      </motion.div>

      {/* Orbiting Nodes */}
      {nodes.slice(1).map((node, idx) => {
        const angle = (idx / (nodes.length - 1)) * Math.PI * 2;
        const radius = 90;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: 1, x, y }}
            transition={{ delay: node.delay, type: "spring", stiffness: 100 }}
            className={`absolute z-10 flex flex-col items-center justify-center w-16 h-16 rounded-full border ${node.border} ${node.bg} backdrop-blur-md`}
          >
            <div className={node.color}>{node.icon}</div>
            <span className="text-[8px] font-bold mt-1 text-white/80 text-center leading-tight">{node.label}</span>
            
            {/* Connecting Line */}
            <motion.svg 
              className="absolute pointer-events-none -z-10"
              style={{
                width: radius * 2,
                height: radius * 2,
                left: -x + 32, // Offset to center of node
                top: -y + 32,
              }}
            >
              <line 
                x1={x + radius - 32} y1={y + radius - 32} 
                x2={radius - 32} y2={radius - 32} 
                stroke="rgba(255,255,255,0.15)" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
            </motion.svg>
          </motion.div>
        );
      })}
    </div>
  );
}
