"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
}

export function NeoButton({
  children,
  variant = "primary",
  href,
  className = "",
  ...props
}: NeoButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Magnetic pull
    x.set((e.clientX - centerX) * 0.2);
    y.set((e.clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseClasses =
    "relative flex items-center justify-center gap-3 overflow-hidden rounded-[24px] px-6 py-3 font-semibold transition-all duration-300 outline-none";

  const variants = {
    primary:
      "bg-gradient-to-br from-emerald-800 via-emerald-600 to-emerald-900 text-white shadow-emerald-facet border-[1.5px] border-amber-400/80 animate-border-glow hover:brightness-110",
    secondary:
      "bg-emerald-950/30 text-gray-200 border border-amber-500/30 shadow-[inset_0_1px_1px_rgba(251,191,36,0.2)] hover:bg-emerald-900/40 hover:border-amber-400/50",
    ghost:
      "text-gray-400 hover:text-amber-400 hover:bg-emerald-900/20",
  };

  const innerContent = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <button
        className={`${baseClasses} ${variants[variant]} ${className}`}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        {variant === "primary" && (
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 blur-md transition-opacity duration-500 -skew-x-12 translate-x-[-100%] hover:translate-x-[100%]" />
        )}
      </button>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {innerContent}
      </Link>
    );
  }

  return innerContent;
}
